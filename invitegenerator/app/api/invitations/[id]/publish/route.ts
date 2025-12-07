import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, GetItemCommand, UpdateItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { randomBytes } from 'crypto';

// Initialize DynamoDB client
const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const INVITATIONS_TABLE = process.env.INVITATIONS_TABLE || 'invitations';
const ELEMENTS_TABLE = process.env.ELEMENTS_TABLE || 'elements';

// ====================
// SECURITY UTILITIES
// ====================

interface AuthUser {
  userId: string;
  email: string;
}

async function verifyToken(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get('auth_token')?.value ||
                  request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) return null;
    
    // In production, verify with AWS Cognito
    // const command = new GetUserCommand({ AccessToken: token });
    // const response = await cognitoClient.send(command);
    
    // For now, decode JWT payload (production must verify signature)
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }
    
    return {
      userId: payload.sub || payload.userId,
      email: payload.email,
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// ====================
// SHORT ID GENERATION
// ====================

/**
 * Generate a unique, URL-safe short ID
 * Format: 8 characters, alphanumeric (a-z, A-Z, 0-9)
 * ~218 trillion combinations - collision resistant
 */
function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = randomBytes(8);
  let shortId = '';
  
  for (let i = 0; i < 8; i++) {
    shortId += chars[bytes[i] % chars.length];
  }
  
  return shortId;
}

/**
 * Check if shortId already exists in database
 */
async function isShortIdUnique(shortId: string): Promise<boolean> {
  try {
    const command = new QueryCommand({
      TableName: INVITATIONS_TABLE,
      IndexName: 'shortId-index',
      KeyConditionExpression: 'shortId = :shortId',
      ExpressionAttributeValues: marshall({
        ':shortId': shortId,
      }),
      Limit: 1,
    });
    
    const response = await dynamodb.send(command);
    return !response.Items || response.Items.length === 0;
  } catch (error) {
    console.error('Error checking shortId uniqueness:', error);
    // If index doesn't exist, assume unique (will fail on update if not)
    return true;
  }
}

/**
 * Generate a unique shortId with retry logic
 */
async function generateUniqueShortId(maxRetries: number = 5): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const shortId = generateShortId();
    const isUnique = await isShortIdUnique(shortId);
    
    if (isUnique) {
      return shortId;
    }
  }
  
  // Fallback: add timestamp suffix for guaranteed uniqueness
  const timestamp = Date.now().toString(36);
  return generateShortId().substring(0, 4) + timestamp.substring(timestamp.length - 4);
}

// ====================
// VALIDATION
// ====================

interface Invitation {
  id: string;
  userId: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  shortId?: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate invitation is ready to publish
 */
async function validateForPublishing(invitation: Invitation): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required: Title
  if (!invitation.title || invitation.title.trim().length === 0) {
    errors.push('Invitation must have a title');
  }
  
  // Required: Not already archived
  if (invitation.status === 'archived') {
    errors.push('Cannot publish an archived invitation. Please restore it first.');
  }
  
  // Warning: No event date
  if (!invitation.eventDate) {
    warnings.push('No event date set. Guests won\'t know when the event is.');
  }
  
  // Warning: No location
  if (!invitation.eventLocation) {
    warnings.push('No event location set. Guests won\'t know where to go.');
  }
  
  // Check if invitation has elements
  try {
    const elementsCommand = new QueryCommand({
      TableName: ELEMENTS_TABLE,
      IndexName: 'invitationId-index',
      KeyConditionExpression: 'invitationId = :invitationId',
      ExpressionAttributeValues: marshall({
        ':invitationId': invitation.id,
      }),
      Limit: 1,
    });
    
    const elementsResponse = await dynamodb.send(elementsCommand);
    
    if (!elementsResponse.Items || elementsResponse.Items.length === 0) {
      warnings.push('Invitation has no design elements. Consider adding content before publishing.');
    }
  } catch (error) {
    // Non-critical - continue with warning
    warnings.push('Could not verify invitation content.');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ====================
// API HANDLERS
// ====================

/**
 * POST /api/invitations/[id]/publish
 * Publish an invitation - generates shortId and makes it publicly accessible
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      );
    }
    
    // Verify authentication
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }
    
    // Get invitation from database
    const getCommand = new GetItemCommand({
      TableName: INVITATIONS_TABLE,
      Key: marshall({ id }),
    });
    
    const getResponse = await dynamodb.send(getCommand);
    
    if (!getResponse.Item) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }
    
    const invitation = unmarshall(getResponse.Item) as Invitation;
    
    // Verify ownership
    if (invitation.userId !== user.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to publish this invitation' },
        { status: 403 }
      );
    }
    
    // Check if already published
    if (invitation.status === 'published' && invitation.shortId) {
      return NextResponse.json({
        success: true,
        message: 'Invitation is already published',
        alreadyPublished: true,
        invitation: {
          id: invitation.id,
          shortId: invitation.shortId,
          status: invitation.status,
          publishedAt: invitation.publishedAt,
          publicUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://invitegenerator.com'}/i/${invitation.shortId}`,
        },
      });
    }
    
    // Validate invitation is ready to publish
    const validation = await validateForPublishing(invitation);
    
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Invitation is not ready to publish',
          validationErrors: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 }
      );
    }
    
    // Parse request body for options
    let options: { force?: boolean } = {};
    try {
      const body = await request.json();
      options = body || {};
    } catch {
      // No body or invalid JSON - use defaults
    }
    
    // If there are warnings and not forcing, return them for confirmation
    if (validation.warnings.length > 0 && !options.force) {
      return NextResponse.json(
        {
          requiresConfirmation: true,
          message: 'Invitation can be published but has warnings',
          warnings: validation.warnings,
          hint: 'Send request with { "force": true } to publish anyway',
        },
        { status: 200 }
      );
    }
    
    // Generate unique shortId (only if not already have one)
    const shortId = invitation.shortId || await generateUniqueShortId();
    const now = new Date().toISOString();
    
    // Update invitation in database
    const updateCommand = new UpdateItemCommand({
      TableName: INVITATIONS_TABLE,
      Key: marshall({ id }),
      UpdateExpression: 'SET #status = :status, shortId = :shortId, publishedAt = :publishedAt, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: marshall({
        ':status': 'published',
        ':shortId': shortId,
        ':publishedAt': invitation.publishedAt || now, // Keep original publish date if republishing
        ':updatedAt': now,
      }),
      ConditionExpression: 'userId = :userId',
      ReturnValues: 'ALL_NEW',
    });
    
    // Add userId to expression values for condition
    updateCommand.input.ExpressionAttributeValues = marshall({
      ':status': 'published',
      ':shortId': shortId,
      ':publishedAt': invitation.publishedAt || now,
      ':updatedAt': now,
      ':userId': user.userId,
    });
    
    const updateResponse = await dynamodb.send(updateCommand);
    const updatedInvitation = unmarshall(updateResponse.Attributes!) as Invitation;
    
    // Generate public URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://invitegenerator.com';
    const publicUrl = `${baseUrl}/i/${shortId}`;
    const rsvpUrl = `${baseUrl}/i/${shortId}/rsvp`;
    
    return NextResponse.json({
      success: true,
      message: 'Invitation published successfully!',
      warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
      invitation: {
        id: updatedInvitation.id,
        title: updatedInvitation.title,
        shortId: updatedInvitation.shortId,
        status: updatedInvitation.status,
        publishedAt: updatedInvitation.publishedAt,
        publicUrl,
        rsvpUrl,
      },
      sharing: {
        url: publicUrl,
        rsvpUrl,
        embedCode: `<iframe src="${publicUrl}?embed=true" width="600" height="800" frameborder="0"></iframe>`,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`,
      },
    });
    
  } catch (error) {
    console.error('Error publishing invitation:', error);
    
    // Handle DynamoDB condition check failure
    if ((error as any).name === 'ConditionalCheckFailedException') {
      return NextResponse.json(
        { error: 'You do not have permission to publish this invitation' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to publish invitation. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/invitations/[id]/publish
 * Unpublish an invitation - sets status back to draft
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      );
    }
    
    // Verify authentication
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }
    
    // Get invitation from database
    const getCommand = new GetItemCommand({
      TableName: INVITATIONS_TABLE,
      Key: marshall({ id }),
    });
    
    const getResponse = await dynamodb.send(getCommand);
    
    if (!getResponse.Item) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }
    
    const invitation = unmarshall(getResponse.Item) as Invitation;
    
    // Verify ownership
    if (invitation.userId !== user.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to unpublish this invitation' },
        { status: 403 }
      );
    }
    
    // Check if already unpublished
    if (invitation.status !== 'published') {
      return NextResponse.json({
        success: true,
        message: 'Invitation is already unpublished',
        invitation: {
          id: invitation.id,
          status: invitation.status,
        },
      });
    }
    
    const now = new Date().toISOString();
    
    // Update invitation - set status to draft but KEEP shortId for future republish
    const updateCommand = new UpdateItemCommand({
      TableName: INVITATIONS_TABLE,
      Key: marshall({ id }),
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: marshall({
        ':status': 'draft',
        ':updatedAt': now,
        ':userId': user.userId,
      }),
      ConditionExpression: 'userId = :userId',
      ReturnValues: 'ALL_NEW',
    });
    
    const updateResponse = await dynamodb.send(updateCommand);
    const updatedInvitation = unmarshall(updateResponse.Attributes!) as Invitation;
    
    return NextResponse.json({
      success: true,
      message: 'Invitation unpublished. The public link will no longer work until you publish again.',
      invitation: {
        id: updatedInvitation.id,
        title: updatedInvitation.title,
        shortId: updatedInvitation.shortId, // Preserved for republishing
        status: updatedInvitation.status,
      },
    });
    
  } catch (error) {
    console.error('Error unpublishing invitation:', error);
    
    if ((error as any).name === 'ConditionalCheckFailedException') {
      return NextResponse.json(
        { error: 'You do not have permission to unpublish this invitation' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to unpublish invitation. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/invitations/[id]/publish
 * Get publish status and sharing information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      );
    }
    
    // Verify authentication
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }
    
    // Get invitation from database
    const getCommand = new GetItemCommand({
      TableName: INVITATIONS_TABLE,
      Key: marshall({ id }),
    });
    
    const getResponse = await dynamodb.send(getCommand);
    
    if (!getResponse.Item) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }
    
    const invitation = unmarshall(getResponse.Item) as Invitation;
    
    // Verify ownership
    if (invitation.userId !== user.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to view this invitation' },
        { status: 403 }
      );
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://invitegenerator.com';
    const isPublished = invitation.status === 'published';
    
    // Validate current state
    const validation = await validateForPublishing(invitation);
    
    const response: any = {
      isPublished,
      status: invitation.status,
      shortId: invitation.shortId || null,
      publishedAt: invitation.publishedAt || null,
      canPublish: validation.valid,
      validationErrors: validation.errors,
      warnings: validation.warnings,
    };
    
    // Include sharing info if published or has shortId
    if (invitation.shortId) {
      const publicUrl = `${baseUrl}/i/${invitation.shortId}`;
      response.sharing = {
        url: publicUrl,
        rsvpUrl: `${publicUrl}/rsvp`,
        embedCode: `<iframe src="${publicUrl}?embed=true" width="600" height="800" frameborder="0"></iframe>`,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`,
        isActive: isPublished,
      };
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error getting publish status:', error);
    return NextResponse.json(
      { error: 'Failed to get publish status' },
      { status: 500 }
    );
  }
}
