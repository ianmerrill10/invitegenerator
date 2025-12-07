import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
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

// Generate URL-safe short ID
function generateShortId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = randomBytes(8);
  let shortId = "";

  for (let i = 0; i < 8; i++) {
    shortId += chars[bytes[i] % chars.length];
  }

  return shortId;
}

// Check if shortId is unique
async function isShortIdUnique(shortId: string): Promise<boolean> {
  try {
    const command = new QueryCommand({
      TableName: process.env.DYNAMODB_INVITATIONS_TABLE,
      IndexName: "shortId-index",
      KeyConditionExpression: "shortId = :shortId",
      ExpressionAttributeValues: {
        ":shortId": shortId,
      },
      Limit: 1,
    });

    const response = await docClient.send(command);
    return !response.Items || response.Items.length === 0;
  } catch {
    return true;
  }
}

// Generate unique shortId with retry
async function generateUniqueShortId(maxRetries: number = 5): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const shortId = generateShortId();
    const isUnique = await isShortIdUnique(shortId);

    if (isUnique) {
      return shortId;
    }
  }

  const timestamp = Date.now().toString(36);
  return generateShortId().substring(0, 4) + timestamp.substring(timestamp.length - 4);
}

function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    { success: false, error: { code: "PUBLISH_ERROR", message } },
    { status }
  );
}

// POST /api/invitations/[id]/publish - Publish invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserFromToken();

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    // Get invitation
    const getCommand = new GetCommand({
      TableName: process.env.DYNAMODB_INVITATIONS_TABLE,
      Key: { id },
    });

    const result = await docClient.send(getCommand);

    if (!result.Item) {
      return errorResponse("Invitation not found", 404);
    }

    if (result.Item.userId !== userId) {
      return errorResponse("Forbidden", 403);
    }

    const invitation = result.Item;

    // Check if already published
    if (invitation.status === "published" && invitation.shortId) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://invitegenerator.com";
      return NextResponse.json({
        success: true,
        message: "Invitation is already published",
        alreadyPublished: true,
        data: {
          ...invitation,
          publicUrl: `${baseUrl}/i/${invitation.shortId}`,
        },
      });
    }

    // Validate for publishing
    const errors: string[] = [];
    if (!invitation.title?.trim()) {
      errors.push("Invitation must have a title");
    }
    if (invitation.status === "archived") {
      errors.push("Cannot publish an archived invitation");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invitation is not ready to publish" },
          validationErrors: errors,
        },
        { status: 400 }
      );
    }

    // Generate shortId
    const shortId = invitation.shortId || (await generateUniqueShortId());
    const now = new Date().toISOString();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://invitegenerator.com";
    const publicUrl = `${baseUrl}/i/${shortId}`;

    // Update invitation
    const updateCommand = new UpdateCommand({
      TableName: process.env.DYNAMODB_INVITATIONS_TABLE,
      Key: { id },
      UpdateExpression:
        "SET #status = :status, shortId = :shortId, publishedAt = :publishedAt, updatedAt = :updatedAt, shareUrl = :shareUrl",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": "published",
        ":shortId": shortId,
        ":publishedAt": invitation.publishedAt || now,
        ":updatedAt": now,
        ":shareUrl": publicUrl,
      },
      ReturnValues: "ALL_NEW",
    });

    const updateResult = await docClient.send(updateCommand);

    return NextResponse.json({
      success: true,
      message: "Invitation published successfully!",
      data: updateResult.Attributes,
      sharing: {
        url: publicUrl,
        rsvpUrl: `${publicUrl}/rsvp`,
        embedCode: `<iframe src="${publicUrl}?embed=true" width="600" height="800" frameborder="0"></iframe>`,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`,
      },
    });
  } catch (error) {
    console.error("Publish invitation error:", error);
    return errorResponse("Failed to publish invitation", 500);
  }
}

// DELETE /api/invitations/[id]/publish - Unpublish invitation
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

    // Get invitation
    const getCommand = new GetCommand({
      TableName: process.env.DYNAMODB_INVITATIONS_TABLE,
      Key: { id },
    });

    const result = await docClient.send(getCommand);

    if (!result.Item) {
      return errorResponse("Invitation not found", 404);
    }

    if (result.Item.userId !== userId) {
      return errorResponse("Forbidden", 403);
    }

    if (result.Item.status !== "published") {
      return NextResponse.json({
        success: true,
        message: "Invitation is already unpublished",
        data: result.Item,
      });
    }

    const now = new Date().toISOString();

    const updateCommand = new UpdateCommand({
      TableName: process.env.DYNAMODB_INVITATIONS_TABLE,
      Key: { id },
      UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": "draft",
        ":updatedAt": now,
      },
      ReturnValues: "ALL_NEW",
    });

    const updateResult = await docClient.send(updateCommand);

    return NextResponse.json({
      success: true,
      message: "Invitation unpublished. The public link will no longer work.",
      data: updateResult.Attributes,
    });
  } catch (error) {
    console.error("Unpublish invitation error:", error);
    return errorResponse("Failed to unpublish invitation", 500);
  }
}
