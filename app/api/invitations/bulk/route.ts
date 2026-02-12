import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { DynamoDBClient, BatchWriteItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const INVITATIONS_TABLE = process.env.DYNAMODB_INVITATIONS_TABLE || "InviteGenerator-Invitations-production";

interface BulkActionRequest {
  action: "archive" | "unarchive" | "delete" | "publish" | "unpublish";
  invitationIds: string[];
}

// POST /api/invitations/bulk - Perform bulk actions on invitations
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body: BulkActionRequest = await request.json();
    const { action, invitationIds } = body;

    if (!action || !invitationIds || !Array.isArray(invitationIds)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "Action and invitation IDs required" } },
        { status: 400 }
      );
    }

    if (invitationIds.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "At least one invitation ID required" } },
        { status: 400 }
      );
    }

    if (invitationIds.length > 25) {
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_ITEMS", message: "Maximum 25 invitations per bulk action" } },
        { status: 400 }
      );
    }

    const validActions = ["archive", "unarchive", "delete", "publish", "unpublish"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_ACTION", message: "Invalid action" } },
        { status: 400 }
      );
    }

    // Verify ownership of all invitations
    const verificationPromises = invitationIds.map(async (id) => {
      const result = await dynamodb.send(
        new QueryCommand({
          TableName: INVITATIONS_TABLE,
          KeyConditionExpression: "id = :id",
          ExpressionAttributeValues: marshall({ ":id": id }),
          ProjectionExpression: "id, userId",
        })
      );

      if (!result.Items || result.Items.length === 0) {
        return { id, valid: false, reason: "not_found" };
      }

      const invitation = unmarshall(result.Items[0]);
      if (invitation.userId !== auth.userId) {
        return { id, valid: false, reason: "forbidden" };
      }

      return { id, valid: true };
    });

    const verificationResults = await Promise.all(verificationPromises);
    const invalidItems = verificationResults.filter((r) => !r.valid);

    if (invalidItems.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Some invitations could not be processed",
            details: invalidItems,
          },
        },
        { status: 400 }
      );
    }

    // Perform the bulk action
    const now = new Date().toISOString();
    const results: { id: string; success: boolean; error?: string }[] = [];

    if (action === "delete") {
      // Batch delete
      const deleteRequests = invitationIds.map((id) => ({
        DeleteRequest: {
          Key: marshall({ id }),
        },
      }));

      // DynamoDB BatchWriteItem supports max 25 items
      await dynamodb.send(
        new BatchWriteItemCommand({
          RequestItems: {
            [INVITATIONS_TABLE]: deleteRequests,
          },
        })
      );

      invitationIds.forEach((id) => results.push({ id, success: true }));
    } else {
      // Batch update (archive, unarchive, publish, unpublish)
      const { UpdateItemCommand } = await import("@aws-sdk/client-dynamodb");

      const updatePromises = invitationIds.map(async (id) => {
        try {
          let updateExpression = "";
          const expressionAttributeValues: Record<string, unknown> = { ":updatedAt": now };
          const expressionAttributeNames: Record<string, string> = {};

          switch (action) {
            case "archive":
              updateExpression = "SET archived = :archived, archivedAt = :archivedAt, updatedAt = :updatedAt";
              expressionAttributeValues[":archived"] = true;
              expressionAttributeValues[":archivedAt"] = now;
              break;
            case "unarchive":
              updateExpression = "SET archived = :archived, updatedAt = :updatedAt REMOVE archivedAt";
              expressionAttributeValues[":archived"] = false;
              break;
            case "publish":
              updateExpression = "SET #status = :status, publishedAt = :publishedAt, updatedAt = :updatedAt";
              expressionAttributeValues[":status"] = "published";
              expressionAttributeValues[":publishedAt"] = now;
              expressionAttributeNames["#status"] = "status";
              break;
            case "unpublish":
              updateExpression = "SET #status = :status, updatedAt = :updatedAt REMOVE publishedAt";
              expressionAttributeValues[":status"] = "draft";
              expressionAttributeNames["#status"] = "status";
              break;
          }

          await dynamodb.send(
            new UpdateItemCommand({
              TableName: INVITATIONS_TABLE,
              Key: marshall({ id }),
              UpdateExpression: updateExpression,
              ExpressionAttributeValues: marshall(expressionAttributeValues),
              ...(Object.keys(expressionAttributeNames).length > 0 && {
                ExpressionAttributeNames: expressionAttributeNames,
              }),
            })
          );

          return { id, success: true };
        } catch (error) {
          console.error(`Failed to ${action} invitation ${id}:`, error);
          return { id, success: false, error: "Update failed" };
        }
      });

      const updateResults = await Promise.all(updatePromises);
      results.push(...updateResults);
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: failureCount === 0,
      data: {
        action,
        processed: invitationIds.length,
        successful: successCount,
        failed: failureCount,
        results,
      },
    });
  } catch (error) {
    console.error("Bulk action error:", error);
    return NextResponse.json(
      { success: false, error: { code: "BULK_ACTION_FAILED", message: "Failed to perform bulk action" } },
      { status: 500 }
    );
  }
}
