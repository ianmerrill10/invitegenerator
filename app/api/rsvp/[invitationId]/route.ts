import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { randomUUID } from 'crypto';
import { verifyAuth } from "@/lib/auth-server";
import { applyRateLimit, PUBLIC_RSVP_RATE_LIMIT } from "@/lib/rate-limit";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const ses = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const INVITATIONS_TABLE = process.env.DYNAMODB_INVITATIONS_TABLE || 'InviteGenerator-Invitations-production';
const RSVP_TABLE = process.env.DYNAMODB_RSVPS_TABLE || 'InviteGenerator-RSVPs-production';
const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || 'InviteGenerator-Users-production';

interface RSVPSubmission {
  name: string;
  email: string;
  phone?: string;
  attending: 'yes' | 'no' | 'maybe';
  guestCount: number;
  guestNames?: string[];
  dietaryRestrictions?: string;
  message?: string;
  customAnswers?: Record<string, string | boolean>;
}

interface Invitation {
  id: string;
  userId: string;
  title: string;
  shortId?: string;
  status?: string;
  eventDate?: string;
  eventTime?: string;
  location?: string;
  eventLocation?: string;
  description?: string;
  rsvpEnabled?: boolean;
  rsvpDeadline?: string;
  maxGuests?: number;
  rsvpSettings?: {
    enabled?: boolean;
    deadline?: string;
    maxGuests?: number;
    maxPlusOnes?: number;
    requireEmail?: boolean;
    requirePhone?: boolean;
    allowMaybe?: boolean;
  };
  rsvpCounts?: {
    yes: number;
    no: number;
    maybe: number;
    total: number;
    totalGuests: number;
  };
  customQuestions?: Array<{
    id: string;
    question: string;
    type: string;
    required?: boolean;
    options?: string[];
  }>;
  createdAt?: string;
  updatedAt?: string;
}

interface RSVPRecord {
  id: string;
  invitationId: string;
  name: string;
  email: string;
  phone?: string | null;
  attending: 'yes' | 'no' | 'maybe';
  guestCount: number;
  guestNames?: string[];
  dietaryRestrictions?: string | null;
  message?: string | null;
  customAnswers?: Record<string, string | boolean> | null;
  createdAt: string;
  updatedAt?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

// POST /api/rsvp/[invitationId] - Submit RSVP
export async function POST(
  request: NextRequest,
  { params }: { params: { invitationId: string } }
) {
  // Apply rate limiting for public RSVP submissions
  const rateLimit = applyRateLimit(request, PUBLIC_RSVP_RATE_LIMIT);
  if (rateLimit.error) {
    return NextResponse.json(
      { error: rateLimit.error.message },
      { status: rateLimit.error.status, headers: rateLimit.headers }
    );
  }

  try {
    const { invitationId } = params;

    // Validate invitation ID format
    if (!invitationId || !/^[a-zA-Z0-9-]{36}$/.test(invitationId)) {
      return NextResponse.json(
        { error: 'Invalid invitation ID' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body: RSVPSubmission = await request.json();
    const validationError = validateRSVPSubmission(body);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // Fetch invitation to verify it exists and RSVP is enabled
    const getInvitationCommand = new GetItemCommand({
      TableName: INVITATIONS_TABLE,
      Key: marshall({ id: invitationId }),
    });

    const invitationResult = await dynamodb.send(getInvitationCommand);
    
    if (!invitationResult.Item) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    const invitation = unmarshall(invitationResult.Item) as Invitation;

    // Check if invitation is published
    if (invitation.status !== 'published') {
      return NextResponse.json(
        { error: 'This invitation is not available' },
        { status: 410 }
      );
    }

    // Check if RSVP is enabled
    const rsvpSettings = invitation.rsvpSettings || {};
    if (!rsvpSettings.enabled) {
      return NextResponse.json(
        { error: 'RSVP is not enabled for this invitation' },
        { status: 400 }
      );
    }

    // Check if RSVP deadline has passed
    if (rsvpSettings.deadline && new Date(rsvpSettings.deadline) < new Date()) {
      return NextResponse.json(
        { error: 'RSVP deadline has passed' },
        { status: 410 }
      );
    }

    // Check for duplicate RSVP (same email)
    const existingRsvpQuery = new QueryCommand({
      TableName: RSVP_TABLE,
      IndexName: 'invitationId-email-index',
      KeyConditionExpression: 'invitationId = :invitationId AND email = :email',
      ExpressionAttributeValues: marshall({
        ':invitationId': invitationId,
        ':email': body.email.toLowerCase(),
      }),
      Limit: 1,
    });

    const existingRsvpResult = await dynamodb.send(existingRsvpQuery);

    // If RSVP already exists, update it instead of creating new
    if (existingRsvpResult.Items && existingRsvpResult.Items.length > 0) {
      const existingRsvp = unmarshall(existingRsvpResult.Items[0]);
      return updateExistingRSVP(existingRsvp.id, body, invitation);
    }

    // Check if max guests limit reached
    if (rsvpSettings.maxGuests) {
      const totalGuestsResult = await getTotalGuestCount(invitationId);
      const requestedGuests = body.attending === 'yes' ? body.guestCount : 0;
      
      if (totalGuestsResult + requestedGuests > rsvpSettings.maxGuests) {
        return NextResponse.json(
          { error: 'Sorry, the maximum number of guests has been reached' },
          { status: 400 }
        );
      }
    }

    // Validate guest count against max plus ones
    if (body.attending === 'yes' && rsvpSettings.maxPlusOnes) {
      if (body.guestCount > rsvpSettings.maxPlusOnes + 1) {
        return NextResponse.json(
          { error: `Maximum ${rsvpSettings.maxPlusOnes + 1} guests allowed` },
          { status: 400 }
        );
      }
    }

    // Create new RSVP
    const rsvpId = randomUUID();
    const now = new Date().toISOString();
    
    const rsvp = {
      id: rsvpId,
      invitationId: invitationId,
      name: sanitizeText(body.name.trim()),
      email: body.email.toLowerCase().trim(),
      phone: body.phone ? sanitizeText(body.phone.trim()) : null,
      attending: body.attending,
      guestCount: body.attending === 'yes' ? Math.max(1, body.guestCount) : 0,
      guestNames: body.guestNames?.map(n => sanitizeText(n.trim())).filter(n => n) || [],
      dietaryRestrictions: body.dietaryRestrictions ? sanitizeText(body.dietaryRestrictions.trim()) : null,
      message: body.message ? sanitizeText(body.message.trim().slice(0, 500)) : null,
      customAnswers: sanitizeCustomAnswers(body.customAnswers),
      createdAt: now,
      updatedAt: now,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent')?.slice(0, 500) || null,
    };

    const putCommand = new PutItemCommand({
      TableName: RSVP_TABLE,
      Item: marshall(rsvp, { removeUndefinedValues: true }),
    });

    await dynamodb.send(putCommand);

    // Update invitation RSVP counts
    await updateRSVPCounts(invitationId);

    // Send notification email to invitation owner (fire and forget)
    sendOwnerNotification(invitation, rsvp).catch(console.error);

    // Send confirmation email to guest (fire and forget)
    sendGuestConfirmation(invitation, rsvp).catch(console.error);

    return NextResponse.json({
      success: true,
      rsvpId: rsvpId,
      message: 'RSVP submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    return NextResponse.json(
      { error: 'Failed to submit RSVP' },
      { status: 500 }
    );
  }
}

// GET /api/rsvp/[invitationId] - Get all RSVPs for an invitation (requires auth)
export async function GET(
  request: NextRequest,
  { params }: { params: { invitationId: string } }
) {
  try {
    const { invitationId } = params;
    
    // Validate invitation ID format
    if (!invitationId || !/^[a-zA-Z0-9-]{36}$/.test(invitationId)) {
      return NextResponse.json(
        { error: 'Invalid invitation ID' },
        { status: 400 }
      );
    }

    // Verify user owns this invitation
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const userId = auth.userId;

    // Fetch invitation to verify ownership
    const getInvitationCommand = new GetItemCommand({
      TableName: INVITATIONS_TABLE,
      Key: marshall({ id: invitationId }),
    });

    const invitationResult = await dynamodb.send(getInvitationCommand);
    
    if (!invitationResult.Item) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    const invitation = unmarshall(invitationResult.Item) as Invitation;

    // Verify ownership
    if (invitation.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const attending = searchParams.get('attending');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const nextToken = searchParams.get('nextToken');

    // Query RSVPs for this invitation
    const queryCommand = new QueryCommand({
      TableName: RSVP_TABLE,
      IndexName: 'invitationId-createdAt-index',
      KeyConditionExpression: 'invitationId = :invitationId',
      ExpressionAttributeValues: marshall({
        ':invitationId': invitationId,
      }),
      ScanIndexForward: false, // Most recent first
      Limit: limit,
      ExclusiveStartKey: nextToken ? JSON.parse(Buffer.from(nextToken, 'base64').toString()) : undefined,
    });

    const result = await dynamodb.send(queryCommand);
    
    let rsvps = result.Items ? result.Items.map(item => unmarshall(item)) : [];

    // Apply filters
    if (attending) {
      rsvps = rsvps.filter(r => r.attending === attending);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      rsvps = rsvps.filter(r => 
        r.name.toLowerCase().includes(searchLower) ||
        r.email.toLowerCase().includes(searchLower)
      );
    }

    // Calculate stats
    const stats = {
      total: rsvps.length,
      attending: rsvps.filter(r => r.attending === 'yes').length,
      notAttending: rsvps.filter(r => r.attending === 'no').length,
      maybe: rsvps.filter(r => r.attending === 'maybe').length,
      totalGuests: rsvps
        .filter(r => r.attending === 'yes')
        .reduce((sum, r) => sum + (r.guestCount || 1), 0),
    };

    return NextResponse.json({
      rsvps,
      stats,
      nextToken: result.LastEvaluatedKey 
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : null,
    });
  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RSVPs' },
      { status: 500 }
    );
  }
}

// Helper functions

function validateRSVPSubmission(body: RSVPSubmission): string | null {
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
    return 'Name is required (minimum 2 characters)';
  }
  
  if (body.name.length > 100) {
    return 'Name is too long (maximum 100 characters)';
  }
  
  if (!body.email || typeof body.email !== 'string') {
    return 'Email is required';
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return 'Please enter a valid email address';
  }
  
  if (body.email.length > 255) {
    return 'Email is too long';
  }
  
  if (!['yes', 'no', 'maybe'].includes(body.attending)) {
    return 'Invalid attendance response';
  }
  
  if (body.guestCount !== undefined) {
    if (typeof body.guestCount !== 'number' || body.guestCount < 0 || body.guestCount > 20) {
      return 'Invalid guest count';
    }
  }
  
  if (body.phone && body.phone.length > 20) {
    return 'Phone number is too long';
  }
  
  if (body.message && body.message.length > 500) {
    return 'Message is too long (maximum 500 characters)';
  }
  
  if (body.dietaryRestrictions && body.dietaryRestrictions.length > 500) {
    return 'Dietary restrictions text is too long';
  }
  
  return null;
}

function sanitizeText(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

function sanitizeCustomAnswers(answers: Record<string, string | boolean> | undefined): Record<string, string | boolean> {
  if (!answers || typeof answers !== 'object') return {};
  
  const sanitized: Record<string, string | boolean> = {};
  
  for (const [key, value] of Object.entries(answers)) {
    if (typeof value === 'string') {
      sanitized[key.slice(0, 50)] = sanitizeText(value.slice(0, 500));
    } else if (typeof value === 'boolean') {
      sanitized[key.slice(0, 50)] = value;
    }
  }
  
  return sanitized;
}

function getClientIP(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || null;
}

async function getTotalGuestCount(invitationId: string): Promise<number> {
  const queryCommand = new QueryCommand({
    TableName: RSVP_TABLE,
    IndexName: 'invitationId-createdAt-index',
    KeyConditionExpression: 'invitationId = :invitationId',
    FilterExpression: 'attending = :yes',
    ExpressionAttributeValues: marshall({
      ':invitationId': invitationId,
      ':yes': 'yes',
    }),
    ProjectionExpression: 'guestCount',
  });

  const result = await dynamodb.send(queryCommand);
  
  if (!result.Items) return 0;
  
  return result.Items.reduce((sum, item) => {
    const rsvp = unmarshall(item);
    return sum + (rsvp.guestCount || 1);
  }, 0);
}

async function updateExistingRSVP(
  rsvpId: string,
  body: RSVPSubmission,
  invitation: Invitation
): Promise<NextResponse> {
  const now = new Date().toISOString();
  
  const updateCommand = new UpdateItemCommand({
    TableName: RSVP_TABLE,
    Key: marshall({ id: rsvpId }),
    UpdateExpression: `SET 
      #name = :name,
      attending = :attending,
      guestCount = :guestCount,
      guestNames = :guestNames,
      dietaryRestrictions = :dietary,
      #message = :message,
      customAnswers = :customAnswers,
      updatedAt = :now
    `,
    ExpressionAttributeNames: {
      '#name': 'name',
      '#message': 'message',
    },
    ExpressionAttributeValues: marshall({
      ':name': sanitizeText(body.name.trim()),
      ':attending': body.attending,
      ':guestCount': body.attending === 'yes' ? Math.max(1, body.guestCount) : 0,
      ':guestNames': body.guestNames?.map(n => sanitizeText(n.trim())).filter(n => n) || [],
      ':dietary': body.dietaryRestrictions ? sanitizeText(body.dietaryRestrictions.trim()) : null,
      ':message': body.message ? sanitizeText(body.message.trim().slice(0, 500)) : null,
      ':customAnswers': sanitizeCustomAnswers(body.customAnswers),
      ':now': now,
    }, { removeUndefinedValues: true }),
  });

  await dynamodb.send(updateCommand);
  
  // Update counts
  await updateRSVPCounts(invitation.id);

  return NextResponse.json({
    success: true,
    rsvpId: rsvpId,
    message: 'RSVP updated successfully',
    updated: true,
  });
}

async function updateRSVPCounts(invitationId: string): Promise<void> {
  // Get all RSVPs for this invitation
  const queryCommand = new QueryCommand({
    TableName: RSVP_TABLE,
    IndexName: 'invitationId-createdAt-index',
    KeyConditionExpression: 'invitationId = :invitationId',
    ExpressionAttributeValues: marshall({
      ':invitationId': invitationId,
    }),
    ProjectionExpression: 'attending, guestCount',
  });

  const result = await dynamodb.send(queryCommand);
  const rsvps = result.Items ? result.Items.map(item => unmarshall(item)) : [];

  const counts = {
    total: rsvps.length,
    attending: rsvps.filter(r => r.attending === 'yes').length,
    notAttending: rsvps.filter(r => r.attending === 'no').length,
    maybe: rsvps.filter(r => r.attending === 'maybe').length,
    totalGuests: rsvps
      .filter(r => r.attending === 'yes')
      .reduce((sum, r) => sum + (r.guestCount || 1), 0),
  };

  const updateCommand = new UpdateItemCommand({
    TableName: INVITATIONS_TABLE,
    Key: marshall({ id: invitationId }),
    UpdateExpression: 'SET rsvpCounts = :counts',
    ExpressionAttributeValues: marshall({
      ':counts': counts,
    }),
  });

  await dynamodb.send(updateCommand);
}

async function sendOwnerNotification(invitation: Invitation, rsvp: RSVPRecord): Promise<void> {
  // Get owner email from users table
  const getUserCommand = new GetItemCommand({
    TableName: USERS_TABLE,
    Key: marshall({ id: invitation.userId }),
    ProjectionExpression: 'email, firstName',
  });

  const userResult = await dynamodb.send(getUserCommand);
  if (!userResult.Item) return;

  const user = unmarshall(userResult.Item);
  
  const attendingText = rsvp.attending === 'yes' 
    ? `will be attending${rsvp.guestCount > 1 ? ` with ${rsvp.guestCount - 1} guest(s)` : ''}`
    : rsvp.attending === 'no'
    ? 'will not be attending'
    : 'might be attending';

  const emailParams = {
    Source: process.env.SES_FROM_EMAIL || 'noreply@invitegenerator.com',
    Destination: {
      ToAddresses: [user.email],
    },
    Message: {
      Subject: {
        Data: `New RSVP for "${invitation.title}"`,
      },
      Body: {
        Html: {
          Data: `
            <html>
              <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #EC4899;">New RSVP Received!</h2>
                <p>Hi ${user.firstName || 'there'},</p>
                <p><strong>${rsvp.name}</strong> ${attendingText} your event "${invitation.title}".</p>
                ${rsvp.message ? `<p><strong>Message:</strong> ${rsvp.message}</p>` : ''}
                ${rsvp.dietaryRestrictions ? `<p><strong>Dietary restrictions:</strong> ${rsvp.dietaryRestrictions}</p>` : ''}
                <p style="margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invitations/${invitation.id}/rsvp" 
                     style="background-color: #EC4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                    View All RSVPs
                  </a>
                </p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                  This email was sent by InviteGenerator. Manage your notification settings in your dashboard.
                </p>
              </body>
            </html>
          `,
        },
        Text: {
          Data: `New RSVP for "${invitation.title}"\n\n${rsvp.name} ${attendingText}.\n\n${rsvp.message ? `Message: ${rsvp.message}\n` : ''}${rsvp.dietaryRestrictions ? `Dietary restrictions: ${rsvp.dietaryRestrictions}\n` : ''}\n\nView all RSVPs at: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invitations/${invitation.id}/rsvp`,
        },
      },
    },
  };

  await ses.send(new SendEmailCommand(emailParams));
}

async function sendGuestConfirmation(invitation: Invitation, rsvp: RSVPRecord): Promise<void> {
  const attendingText = rsvp.attending === 'yes' 
    ? 'Thank you for confirming your attendance!'
    : rsvp.attending === 'no'
    ? 'Thank you for letting us know you won\'t be able to make it.'
    : 'Thank you for your response. We hope you can make it!';

  const emailParams = {
    Source: process.env.SES_FROM_EMAIL || 'noreply@invitegenerator.com',
    Destination: {
      ToAddresses: [rsvp.email],
    },
    Message: {
      Subject: {
        Data: `RSVP Confirmation - ${invitation.title}`,
      },
      Body: {
        Html: {
          Data: `
            <html>
              <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #EC4899;">RSVP Confirmed!</h2>
                <p>Hi ${rsvp.name},</p>
                <p>${attendingText}</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">${invitation.title}</h3>
                  ${invitation.eventDate ? `<p><strong>When:</strong> ${new Date(invitation.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>` : ''}
                  ${invitation.eventLocation ? `<p><strong>Where:</strong> ${invitation.eventLocation}</p>` : ''}
                </div>
                <p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/i/${invitation.shortId}" 
                     style="color: #EC4899; text-decoration: underline;">
                    View Invitation
                  </a>
                </p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                  Need to change your RSVP? Simply visit the invitation link and submit a new response.
                </p>
              </body>
            </html>
          `,
        },
        Text: {
          Data: `RSVP Confirmed!\n\nHi ${rsvp.name},\n\n${attendingText}\n\n${invitation.title}\n${invitation.eventDate ? `When: ${new Date(invitation.eventDate).toLocaleString()}\n` : ''}${invitation.eventLocation ? `Where: ${invitation.eventLocation}\n` : ''}\n\nView invitation: ${process.env.NEXT_PUBLIC_APP_URL}/i/${invitation.shortId}`,
        },
      },
    },
  };

  await ses.send(new SendEmailCommand(emailParams));
}
