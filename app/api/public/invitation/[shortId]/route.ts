import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, GetItemCommand, QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';
import { applyRateLimit, PUBLIC_VIEW_RATE_LIMIT } from "@/lib/rate-limit";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const INVITATIONS_TABLE = process.env.DYNAMODB_INVITATIONS_TABLE || 'InviteGenerator-Invitations-production';
const ELEMENTS_TABLE = process.env.DYNAMODB_ELEMENTS_TABLE || 'InviteGenerator-Elements-production';

// GET /api/public/invitation/[shortId] - Get public invitation view
export async function GET(
  request: NextRequest,
  { params }: { params: { shortId: string } }
) {
  // Apply rate limiting for public views
  const rateLimit = applyRateLimit(request, PUBLIC_VIEW_RATE_LIMIT);
  if (rateLimit.error) {
    return NextResponse.json(
      { success: false, error: { code: "RATE_LIMITED", message: rateLimit.error.message } },
      { status: rateLimit.error.status, headers: rateLimit.headers }
    );
  }

  try {
    const { shortId } = params;

    // Validate shortId format (alphanumeric, 6-12 chars)
    if (!shortId || !/^[a-zA-Z0-9]{6,12}$/.test(shortId)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: 'Invalid invitation ID' } },
        { status: 400 }
      );
    }

    // Query invitation by shortId using GSI
    const queryCommand = new QueryCommand({
      TableName: INVITATIONS_TABLE,
      IndexName: 'shortId-index',
      KeyConditionExpression: 'shortId = :shortId',
      ExpressionAttributeValues: marshall({
        ':shortId': shortId,
      }),
      Limit: 1,
    });

    const queryResult = await dynamodb.send(queryCommand);
    
    if (!queryResult.Items || queryResult.Items.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: 'Invitation not found' } },
        { status: 404 }
      );
    }

    const invitation = unmarshall(queryResult.Items[0]);

    // Check if invitation is published
    if (invitation.status !== 'published') {
      return NextResponse.json(
        { success: false, error: { code: "NOT_AVAILABLE", message: 'This invitation is not available' } },
        { status: 410 }
      );
    }

    // Check if invitation has expired (if expiry date is set)
    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: { code: "EXPIRED", message: 'This invitation has expired' } },
        { status: 410 }
      );
    }

    // Track view count (fire and forget, don't wait)
    trackView(invitation.id).catch(console.error);

    // Fetch invitation elements
    const elementsCommand = new QueryCommand({
      TableName: ELEMENTS_TABLE,
      KeyConditionExpression: 'invitationId = :invitationId',
      ExpressionAttributeValues: marshall({
        ':invitationId': invitation.id,
      }),
    });

    const elementsResult = await dynamodb.send(elementsCommand);
    const elements = elementsResult.Items 
      ? elementsResult.Items.map(item => unmarshall(item))
      : [];

    // Sort elements by zIndex
    elements.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    // Sanitize invitation data for public view (remove sensitive fields)
    const publicInvitation = {
      id: invitation.id,
      shortId: invitation.shortId,
      title: sanitizeText(invitation.title),
      description: sanitizeText(invitation.description),
      type: invitation.type,
      template: invitation.template,
      settings: invitation.settings,
      createdAt: invitation.createdAt,
    };

    // Sanitize elements
    const publicElements = elements.map(el => ({
      id: el.id,
      type: el.type,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      rotation: el.rotation,
      opacity: el.opacity,
      zIndex: el.zIndex,
      properties: sanitizeElementProperties(el.properties),
    }));

    // Extract RSVP settings
    const rsvpSettings = invitation.rsvpSettings || {};

    return NextResponse.json({
      success: true,
      data: {
        invitation: publicInvitation,
        elements: publicElements,
        rsvpEnabled: rsvpSettings.enabled || false,
        rsvpDeadline: rsvpSettings.deadline,
        eventDate: invitation.eventDate,
        eventLocation: invitation.eventLocation,
      },
    });
  } catch (error) {
    console.error('Error fetching public invitation:', error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: 'Failed to load invitation' } },
      { status: 500 }
    );
  }
}

// Track view count
async function trackView(invitationId: string): Promise<void> {
  const updateCommand = new UpdateItemCommand({
    TableName: INVITATIONS_TABLE,
    Key: marshall({ id: invitationId }),
    UpdateExpression: 'SET viewCount = if_not_exists(viewCount, :zero) + :one, lastViewedAt = :now',
    ExpressionAttributeValues: marshall({
      ':zero': 0,
      ':one': 1,
      ':now': new Date().toISOString(),
    }),
  });

  await dynamodb.send(updateCommand);
}

// Sanitize text to prevent XSS
function sanitizeText(text: string | undefined): string {
  if (!text) return '';
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Sanitize element properties
function sanitizeElementProperties(properties: Record<string, any> | undefined): Record<string, any> {
  if (!properties) return {};
  
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === 'string') {
      // Sanitize string values, but preserve certain safe HTML for text elements
      if (key === 'text') {
        // Allow basic formatting tags but remove scripts and event handlers
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/on\w+="[^"]*"/gi, '')
          .replace(/on\w+='[^']*'/gi, '')
          .replace(/javascript:/gi, '');
      } else if (key === 'src' || key === 'href') {
        // Validate URLs
        if (isValidUrl(value)) {
          sanitized[key] = value;
        }
      } else {
        sanitized[key] = sanitizeText(value);
      }
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v => typeof v === 'string' ? sanitizeText(v) : v);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeElementProperties(value);
    }
  }
  
  return sanitized;
}

// Validate URL
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http, https, and data URIs for images
    return ['http:', 'https:', 'data:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
