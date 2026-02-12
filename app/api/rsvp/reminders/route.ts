import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { DynamoDBClient, QueryCommand, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const INVITATIONS_TABLE = process.env.DYNAMODB_INVITATIONS_TABLE || "InviteGenerator-Invitations-production";
const RSVP_TABLE = process.env.DYNAMODB_RSVPS_TABLE || "InviteGenerator-RSVPs-production";
const REMINDERS_TABLE = process.env.DYNAMODB_REMINDERS_TABLE || "InviteGenerator-Reminders-production";

interface ReminderRequest {
  invitationId: string;
  targetAudience: "all" | "no-response" | "maybe";
  message?: string;
  scheduledFor?: string;
}

// GET /api/rsvp/reminders - Get scheduled reminders for user's invitations
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get("invitationId");

    // Query reminders for user
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: REMINDERS_TABLE,
        IndexName: "userId-index",
        KeyConditionExpression: "userId = :userId",
        FilterExpression: invitationId ? "invitationId = :invitationId" : undefined,
        ExpressionAttributeValues: marshall(
          invitationId
            ? { ":userId": auth.userId, ":invitationId": invitationId }
            : { ":userId": auth.userId }
        ),
      })
    );

    const reminders = (result.Items || []).map((item) => unmarshall(item));

    // Sort by scheduled date
    reminders.sort((a, b) => {
      const dateA = new Date(a.scheduledFor).getTime();
      const dateB = new Date(b.scheduledFor).getTime();
      return dateA - dateB;
    });

    return NextResponse.json({
      success: true,
      data: { reminders },
    });
  } catch (error) {
    console.error("Get reminders error:", error);
    return NextResponse.json(
      { success: false, error: { code: "FETCH_FAILED", message: "Failed to fetch reminders" } },
      { status: 500 }
    );
  }
}

// POST /api/rsvp/reminders - Schedule a reminder
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body: ReminderRequest = await request.json();
    const { invitationId, targetAudience, message, scheduledFor } = body;

    if (!invitationId || !targetAudience) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "Missing required fields" } },
        { status: 400 }
      );
    }

    // Verify invitation ownership
    const invitationResult = await dynamodb.send(
      new GetItemCommand({
        TableName: INVITATIONS_TABLE,
        Key: marshall({ id: invitationId }),
      })
    );

    if (!invitationResult.Item) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Invitation not found" } },
        { status: 404 }
      );
    }

    const invitation = unmarshall(invitationResult.Item);

    if (invitation.userId !== auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    // Get recipients based on target audience
    const rsvpResult = await dynamodb.send(
      new QueryCommand({
        TableName: RSVP_TABLE,
        IndexName: "invitationId-index",
        KeyConditionExpression: "invitationId = :invitationId",
        ExpressionAttributeValues: marshall({ ":invitationId": invitationId }),
      })
    );

    const allRsvps = (rsvpResult.Items || []).map((item) => unmarshall(item));

    let recipients: string[] = [];
    switch (targetAudience) {
      case "no-response":
        recipients = allRsvps
          .filter((r) => !r.response || r.response === "pending")
          .map((r) => r.email)
          .filter(Boolean);
        break;
      case "maybe":
        recipients = allRsvps
          .filter((r) => r.response === "maybe")
          .map((r) => r.email)
          .filter(Boolean);
        break;
      case "all":
      default:
        recipients = allRsvps.map((r) => r.email).filter(Boolean);
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "NO_RECIPIENTS", message: "No recipients found for this audience" } },
        { status: 400 }
      );
    }

    // Create reminder
    const reminder = {
      id: uuidv4(),
      userId: auth.userId,
      invitationId,
      invitationTitle: invitation.title,
      targetAudience,
      message: message || `Reminder: Please RSVP for ${invitation.title}`,
      recipients,
      recipientCount: recipients.length,
      scheduledFor: scheduledFor || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default: 24 hours
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };

    await dynamodb.send(
      new PutItemCommand({
        TableName: REMINDERS_TABLE,
        Item: marshall(reminder),
      })
    );

    return NextResponse.json({
      success: true,
      data: { reminder },
    });
  } catch (error) {
    console.error("Schedule reminder error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SCHEDULE_FAILED", message: "Failed to schedule reminder" } },
      { status: 500 }
    );
  }
}

// DELETE /api/rsvp/reminders - Cancel a scheduled reminder
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reminderId = searchParams.get("id");

    if (!reminderId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "Reminder ID required" } },
        { status: 400 }
      );
    }

    // Get reminder to verify ownership
    const reminderResult = await dynamodb.send(
      new GetItemCommand({
        TableName: REMINDERS_TABLE,
        Key: marshall({ id: reminderId }),
      })
    );

    if (!reminderResult.Item) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Reminder not found" } },
        { status: 404 }
      );
    }

    const reminder = unmarshall(reminderResult.Item);

    if (reminder.userId !== auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    if (reminder.status === "sent") {
      return NextResponse.json(
        { success: false, error: { code: "ALREADY_SENT", message: "Reminder has already been sent" } },
        { status: 400 }
      );
    }

    // Mark as cancelled instead of deleting
    const { UpdateItemCommand } = await import("@aws-sdk/client-dynamodb");
    await dynamodb.send(
      new UpdateItemCommand({
        TableName: REMINDERS_TABLE,
        Key: marshall({ id: reminderId }),
        UpdateExpression: "SET #status = :status, cancelledAt = :cancelledAt",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: marshall({
          ":status": "cancelled",
          ":cancelledAt": new Date().toISOString(),
        }),
      })
    );

    return NextResponse.json({
      success: true,
      data: { message: "Reminder cancelled" },
    });
  } catch (error) {
    console.error("Cancel reminder error:", error);
    return NextResponse.json(
      { success: false, error: { code: "CANCEL_FAILED", message: "Failed to cancel reminder" } },
      { status: 500 }
    );
  }
}
