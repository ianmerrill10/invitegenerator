import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Initialize DynamoDB
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Helper to get user from token
async function getUserFromToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const idToken = cookieStore.get("id_token")?.value;

    if (!accessToken && !idToken) {
      return null;
    }

    const token = idToken || accessToken;
    const decoded = jwt.decode(token!) as { sub?: string };
    return decoded?.sub || null;
  } catch (error) {
    console.error("Token decode error:", error);
    return null;
  }
}

// Helper to create error response
function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: { code: "INVITATION_ERROR", message },
    },
    { status }
  );
}

// GET /api/invitations/[id] - Get single invitation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserFromToken();

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const getCommand = new GetCommand({
      TableName: process.env.DYNAMODB_INVITATIONS_TABLE,
      Key: { id },
    });

    const result = await docClient.send(getCommand);

    if (!result.Item) {
      return errorResponse("Invitation not found", 404);
    }

    // Verify ownership
    if (result.Item.userId !== userId) {
      return errorResponse("Forbidden", 403);
    }

    return NextResponse.json({
      success: true,
      data: result.Item,
    });
  } catch (error) {
    console.error("Get invitation error:", error);
    return errorResponse("Failed to fetch invitation", 500);
  }
}

// PATCH /api/invitations/[id] - Update invitation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserFromToken();

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    // First verify the invitation exists and belongs to user
    const getCommand = new GetCommand({
      TableName: process.env.DYNAMODB_INVITATIONS_TABLE,
      Key: { id },
    });

    const existing = await docClient.send(getCommand);

    if (!existing.Item) {
      return errorResponse("Invitation not found", 404);
    }

    if (existing.Item.userId !== userId) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const now = new Date().toISOString();

    // Build update expression dynamically
    const updateFields: string[] = ["updatedAt = :updatedAt"];
    const expressionValues: Record<string, unknown> = { ":updatedAt": now };
    const expressionNames: Record<string, string> = {};

    const allowedFields = [
      "title",
      "eventType",
      "eventDate",
      "eventTime",
      "eventEndDate",
      "eventEndTime",
      "location",
      "description",
      "hostName",
      "hostEmail",
      "designData",
      "rsvpSettings",
      "status",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Handle reserved words
        if (field === "location" || field === "status") {
          expressionNames[`#${field}`] = field;
          updateFields.push(`#${field} = :${field}`);
        } else {
          updateFields.push(`${field} = :${field}`);
        }
        expressionValues[`:${field}`] = body[field];
      }
    }

    const updateCommand = new UpdateCommand({
      TableName: process.env.DYNAMODB_INVITATIONS_TABLE,
      Key: { id },
      UpdateExpression: `SET ${updateFields.join(", ")}`,
      ExpressionAttributeValues: expressionValues,
      ...(Object.keys(expressionNames).length > 0 && {
        ExpressionAttributeNames: expressionNames,
      }),
      ReturnValues: "ALL_NEW",
    });

    const result = await docClient.send(updateCommand);

    return NextResponse.json({
      success: true,
      data: result.Attributes,
    });
  } catch (error) {
    console.error("Update invitation error:", error);
    return errorResponse("Failed to update invitation", 500);
  }
}

// DELETE /api/invitations/[id] - Delete invitation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserFromToken();

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    // First verify the invitation exists and belongs to user
    const getCommand = new GetCommand({
      TableName: process.env.DYNAMODB_INVITATIONS_TABLE,
      Key: { id },
    });

    const existing = await docClient.send(getCommand);

    if (!existing.Item) {
      return errorResponse("Invitation not found", 404);
    }

    if (existing.Item.userId !== userId) {
      return errorResponse("Forbidden", 403);
    }

    const deleteCommand = new DeleteCommand({
      TableName: process.env.DYNAMODB_INVITATIONS_TABLE,
      Key: { id },
    });

    await docClient.send(deleteCommand);

    return NextResponse.json({
      success: true,
      message: "Invitation deleted successfully",
    });
  } catch (error) {
    console.error("Delete invitation error:", error);
    return errorResponse("Failed to delete invitation", 500);
  }
}
