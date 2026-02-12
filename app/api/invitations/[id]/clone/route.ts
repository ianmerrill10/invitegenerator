import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { nanoid } from "nanoid";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const INVITATIONS_TABLE = process.env.DYNAMODB_INVITATIONS_TABLE || "InviteGenerator-Invitations-production";

// POST /api/invitations/[id]/clone - Clone an invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { newTitle } = body;

    // Get original invitation
    const result = await dynamodb.send(
      new GetItemCommand({
        TableName: INVITATIONS_TABLE,
        Key: marshall({ id }),
      })
    );

    if (!result.Item) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Invitation not found" } },
        { status: 404 }
      );
    }

    const original = unmarshall(result.Item);

    // Verify ownership
    if (original.userId !== auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    // Create cloned invitation
    const now = new Date().toISOString();
    const newId = uuidv4();
    const newShortId = nanoid(10);

    // Remove fields that shouldn't be cloned
    const {
      stripeSessionId: _stripe,
      paymentId: _payment,
      ...baseInvitation
    } = original as Record<string, unknown>;

    const clonedInvitation = {
      ...baseInvitation,
      id: newId,
      shortId: newShortId,
      title: newTitle || `${original.title} (Copy)`,
      status: "draft",
      published: false,
      publishedAt: null,
      archived: false,
      archivedAt: null,
      // Reset analytics
      views: 0,
      rsvpCount: 0,
      // Reset RSVP data
      totalGuests: 0,
      confirmedGuests: 0,
      declinedGuests: 0,
      maybeGuests: 0,
      pendingGuests: 0,
      // Set new timestamps
      createdAt: now,
      updatedAt: now,
      clonedFrom: id,
    };

    await dynamodb.send(
      new PutItemCommand({
        TableName: INVITATIONS_TABLE,
        Item: marshall(clonedInvitation, { removeUndefinedValues: true }),
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        invitation: clonedInvitation,
        originalId: id,
      },
    });
  } catch (error) {
    console.error("Clone invitation error:", error);
    return NextResponse.json(
      { success: false, error: { code: "CLONE_FAILED", message: "Failed to clone invitation" } },
      { status: 500 }
    );
  }
}
