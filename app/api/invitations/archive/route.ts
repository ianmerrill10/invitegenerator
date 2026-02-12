import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { DynamoDBClient, QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const INVITATIONS_TABLE = process.env.DYNAMODB_INVITATIONS_TABLE || "InviteGenerator-Invitations-production";

// GET /api/invitations/archive - Get archived invitations
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    // Query for archived invitations
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: INVITATIONS_TABLE,
        IndexName: "userId-index",
        KeyConditionExpression: "userId = :userId",
        FilterExpression: "#status = :status",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: marshall({
          ":userId": auth.userId,
          ":status": "archived",
        }),
      })
    );

    const invitations = (result.Items || []).map((item) => unmarshall(item));

    // Sort by archived date (most recent first)
    invitations.sort((a, b) => {
      const dateA = new Date(a.archivedAt || a.updatedAt).getTime();
      const dateB = new Date(b.archivedAt || b.updatedAt).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      data: { invitations },
    });
  } catch (error) {
    console.error("Get archived error:", error);
    return NextResponse.json(
      { success: false, error: { code: "FETCH_FAILED", message: "Failed to fetch archived invitations" } },
      { status: 500 }
    );
  }
}

// POST /api/invitations/archive - Archive or unarchive invitations
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { invitationIds, action } = body;

    if (!Array.isArray(invitationIds) || invitationIds.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "No invitation IDs provided" } },
        { status: 400 }
      );
    }

    if (!["archive", "unarchive"].includes(action)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "Invalid action" } },
        { status: 400 }
      );
    }

    const results: { id: string; success: boolean; error?: string }[] = [];

    // Process each invitation
    for (const invitationId of invitationIds) {
      try {
        const newStatus = action === "archive" ? "archived" : "draft";

        await dynamodb.send(
          new UpdateItemCommand({
            TableName: INVITATIONS_TABLE,
            Key: marshall({ id: invitationId }),
            UpdateExpression: "SET #status = :status, archivedAt = :archivedAt, updatedAt = :updatedAt",
            ConditionExpression: "userId = :userId",
            ExpressionAttributeNames: {
              "#status": "status",
            },
            ExpressionAttributeValues: marshall({
              ":status": newStatus,
              ":archivedAt": action === "archive" ? new Date().toISOString() : null,
              ":updatedAt": new Date().toISOString(),
              ":userId": auth.userId,
            }),
          })
        );

        results.push({ id: invitationId, success: true });
      } catch (err) {
        results.push({
          id: invitationId,
          success: false,
          error: "Failed to update invitation",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      data: {
        action,
        processed: results.length,
        succeeded: successCount,
        failed: results.length - successCount,
        results,
      },
    });
  } catch (error) {
    console.error("Archive error:", error);
    return NextResponse.json(
      { success: false, error: { code: "ARCHIVE_FAILED", message: "Failed to archive invitations" } },
      { status: 500 }
    );
  }
}
