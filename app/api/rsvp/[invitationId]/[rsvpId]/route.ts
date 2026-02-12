import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, DeleteItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { verifyAuth } from "@/lib/auth-server";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const INVITATIONS_TABLE = process.env.DYNAMODB_INVITATIONS_TABLE || 'InviteGenerator-Invitations-production';
const RSVP_TABLE = process.env.DYNAMODB_RSVPS_TABLE || 'InviteGenerator-RSVPs-production';

// DELETE /api/rsvp/[invitationId]/[rsvpId] - Delete a specific RSVP
export async function DELETE(
  request: NextRequest,
  { params }: { params: { invitationId: string; rsvpId: string } }
) {
  try {
    const { invitationId, rsvpId } = params;
    
    // Verify authentication
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Validate IDs
    if (!invitationId || !/^[a-zA-Z0-9-]{36}$/.test(invitationId)) {
      return NextResponse.json(
        { error: 'Invalid invitation ID' },
        { status: 400 }
      );
    }
    
    if (!rsvpId || !/^[a-zA-Z0-9-]{36}$/.test(rsvpId)) {
      return NextResponse.json(
        { error: 'Invalid RSVP ID' },
        { status: 400 }
      );
    }
    
    // Verify invitation ownership
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
    
    const invitation = unmarshall(invitationResult.Item);
    
    if (invitation.userId !== auth.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to manage this invitation' },
        { status: 403 }
      );
    }
    
    // Verify RSVP exists and belongs to this invitation
    const getRsvpCommand = new GetItemCommand({
      TableName: RSVP_TABLE,
      Key: marshall({ id: rsvpId }),
    });
    
    const rsvpResult = await dynamodb.send(getRsvpCommand);
    
    if (!rsvpResult.Item) {
      return NextResponse.json(
        { error: 'RSVP not found' },
        { status: 404 }
      );
    }
    
    const rsvp = unmarshall(rsvpResult.Item);
    
    if (rsvp.invitationId !== invitationId) {
      return NextResponse.json(
        { error: 'RSVP does not belong to this invitation' },
        { status: 403 }
      );
    }
    
    // Delete the RSVP
    const deleteCommand = new DeleteItemCommand({
      TableName: RSVP_TABLE,
      Key: marshall({ id: rsvpId }),
    });
    
    await dynamodb.send(deleteCommand);
    
    return NextResponse.json({ 
      success: true,
      message: 'RSVP deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting RSVP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/rsvp/[invitationId]/[rsvpId] - Get a specific RSVP
export async function GET(
  request: NextRequest,
  { params }: { params: { invitationId: string; rsvpId: string } }
) {
  try {
    const { invitationId, rsvpId } = params;
    
    // Verify authentication
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Validate IDs
    if (!invitationId || !/^[a-zA-Z0-9-]{36}$/.test(invitationId)) {
      return NextResponse.json(
        { error: 'Invalid invitation ID' },
        { status: 400 }
      );
    }
    
    if (!rsvpId || !/^[a-zA-Z0-9-]{36}$/.test(rsvpId)) {
      return NextResponse.json(
        { error: 'Invalid RSVP ID' },
        { status: 400 }
      );
    }
    
    // Verify invitation ownership
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
    
    const invitation = unmarshall(invitationResult.Item);
    
    if (invitation.userId !== auth.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to view this RSVP' },
        { status: 403 }
      );
    }
    
    // Get the RSVP
    const getRsvpCommand = new GetItemCommand({
      TableName: RSVP_TABLE,
      Key: marshall({ id: rsvpId }),
    });
    
    const rsvpResult = await dynamodb.send(getRsvpCommand);
    
    if (!rsvpResult.Item) {
      return NextResponse.json(
        { error: 'RSVP not found' },
        { status: 404 }
      );
    }
    
    const rsvp = unmarshall(rsvpResult.Item);
    
    if (rsvp.invitationId !== invitationId) {
      return NextResponse.json(
        { error: 'RSVP does not belong to this invitation' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(rsvp);
    
  } catch (error) {
    console.error('Error fetching RSVP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
