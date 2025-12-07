import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const INVITATIONS_TABLE = process.env.DYNAMODB_INVITATIONS_TABLE || 'invitations';

// GET /api/public/invitation/[shortId]/rsvp-details - Get RSVP form configuration
export async function GET(
  request: NextRequest,
  { params }: { params: { shortId: string } }
) {
  try {
    const { shortId } = params;
    
    // Validate shortId format (alphanumeric, 6-12 chars)
    if (!shortId || !/^[a-zA-Z0-9]{6,12}$/.test(shortId)) {
      return NextResponse.json(
        { error: 'Invalid invitation ID' },
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
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    const invitation = unmarshall(queryResult.Items[0]);

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
        { status: 404 }
      );
    }

    // Check if RSVP deadline has passed
    if (rsvpSettings.deadline && new Date(rsvpSettings.deadline) < new Date()) {
      return NextResponse.json(
        { error: 'RSVP deadline has passed' },
        { status: 410 }
      );
    }

    // Sanitize and return RSVP configuration
    const rsvpDetails = {
      id: invitation.id,
      shortId: invitation.shortId,
      title: sanitizeText(invitation.title),
      eventDate: invitation.eventDate,
      eventLocation: sanitizeText(invitation.eventLocation),
      rsvpDeadline: rsvpSettings.deadline,
      maxGuests: rsvpSettings.maxGuests,
      requirePhone: rsvpSettings.requirePhone || false,
      requireDietary: rsvpSettings.requireDietary || false,
      allowPlusOne: rsvpSettings.allowPlusOne || false,
      maxPlusOnes: rsvpSettings.maxPlusOnes || 0,
      customQuestions: sanitizeCustomQuestions(rsvpSettings.customQuestions),
    };

    return NextResponse.json(rsvpDetails);
  } catch (error) {
    console.error('Error fetching RSVP details:', error);
    return NextResponse.json(
      { error: 'Failed to load RSVP form' },
      { status: 500 }
    );
  }
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

// Sanitize custom questions
function sanitizeCustomQuestions(questions: any[] | undefined): any[] {
  if (!questions || !Array.isArray(questions)) return [];
  
  return questions
    .filter(q => q && typeof q === 'object')
    .map(q => ({
      id: String(q.id || '').slice(0, 50),
      question: sanitizeText(String(q.question || '').slice(0, 500)),
      type: ['text', 'select', 'checkbox'].includes(q.type) ? q.type : 'text',
      required: Boolean(q.required),
      options: Array.isArray(q.options) 
        ? q.options.slice(0, 20).map((o: any) => sanitizeText(String(o).slice(0, 100)))
        : undefined,
    }))
    .slice(0, 10); // Limit to 10 custom questions
}
