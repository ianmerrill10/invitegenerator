import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, GetItemCommand, UpdateItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { verifyAuth } from "@/lib/auth-server";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const INVITATIONS_TABLE = process.env.DYNAMODB_INVITATIONS_TABLE || 'InviteGenerator-Invitations-production';

// GET /api/invitations/[id] - Get a specific invitation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Verify authentication
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Validate invitation ID
    if (!id || !/^[a-zA-Z0-9-]{36}$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid invitation ID' },
        { status: 400 }
      );
    }
    
    // Fetch invitation
    const getCommand = new GetItemCommand({
      TableName: INVITATIONS_TABLE,
      Key: marshall({ id }),
    });
    
    const result = await dynamodb.send(getCommand);
    
    if (!result.Item) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }
    
    const invitation = unmarshall(result.Item);
    
    // Verify ownership
    if (invitation.userId !== auth.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to view this invitation' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(invitation);
    
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/invitations/[id] - Update an invitation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Verify authentication
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Validate invitation ID
    if (!id || !/^[a-zA-Z0-9-]{36}$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid invitation ID' },
        { status: 400 }
      );
    }
    
    // Fetch existing invitation
    const getCommand = new GetItemCommand({
      TableName: INVITATIONS_TABLE,
      Key: marshall({ id }),
    });
    
    const result = await dynamodb.send(getCommand);
    
    if (!result.Item) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }
    
    const existingInvitation = unmarshall(result.Item);
    
    // Verify ownership
    if (existingInvitation.userId !== auth.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to update this invitation' },
        { status: 403 }
      );
    }
    
    // Parse update data
    const body = await request.json();
    
    // Sanitize and validate input
    const allowedFields = [
      'title', 'description', 'eventDate', 'eventTime', 'eventEndDate', 
      'eventEndTime', 'location', 'hostName', 'designData', 'rsvpSettings',
      'settings', 'status'
    ];
    
    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Sanitize string fields
        if (typeof body[field] === 'string') {
          updates[field] = sanitizeString(body[field]);
        } else {
          updates[field] = body[field];
        }
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    // Build update expression
    updates.updatedAt = new Date().toISOString();
    
    const updateExpression = 'SET ' + Object.keys(updates)
      .map((key, i) => `#field${i} = :value${i}`)
      .join(', ');
    
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};
    
    Object.keys(updates).forEach((key, i) => {
      expressionAttributeNames[`#field${i}`] = key;
      expressionAttributeValues[`:value${i}`] = updates[key as keyof typeof updates];
    });
    
    const updateCommand = new UpdateItemCommand({
      TableName: INVITATIONS_TABLE,
      Key: marshall({ id }),
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ReturnValues: 'ALL_NEW',
    });
    
    const updateResult = await dynamodb.send(updateCommand);
    const updatedInvitation = updateResult.Attributes ? unmarshall(updateResult.Attributes) : null;
    
    return NextResponse.json(updatedInvitation);
    
  } catch (error) {
    console.error('Error updating invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/invitations/[id] - Delete an invitation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Verify authentication
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Validate invitation ID
    if (!id || !/^[a-zA-Z0-9-]{36}$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid invitation ID' },
        { status: 400 }
      );
    }
    
    // Fetch existing invitation
    const getCommand = new GetItemCommand({
      TableName: INVITATIONS_TABLE,
      Key: marshall({ id }),
    });
    
    const result = await dynamodb.send(getCommand);
    
    if (!result.Item) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }
    
    const existingInvitation = unmarshall(result.Item);
    
    // Verify ownership
    if (existingInvitation.userId !== auth.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this invitation' },
        { status: 403 }
      );
    }
    
    // Delete the invitation
    const deleteCommand = new DeleteItemCommand({
      TableName: INVITATIONS_TABLE,
      Key: marshall({ id }),
    });
    
    await dynamodb.send(deleteCommand);
    
    // Note: In a production system, you would also want to:
    // 1. Delete all RSVPs associated with this invitation
    // 2. Delete any uploaded assets from S3
    // 3. Potentially archive instead of hard delete
    
    return NextResponse.json({ 
      success: true,
      message: 'Invitation deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to sanitize strings
function sanitizeString(str: string): string {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
    .slice(0, 10000); // Limit length
}
