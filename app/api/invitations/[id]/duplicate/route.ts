import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
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

function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    { success: false, error: { code: "DUPLICATE_ERROR", message } },
    { status }
  );
}

// POST /api/invitations/[id]/duplicate - Duplicate invitation
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

    // Get original invitation
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

    const original = result.Item;
    const now = new Date().toISOString();
    const newId = uuidv4();
    const shortId = newId.slice(0, 8);

    // Create duplicate
    const duplicate = {
      ...original,
      id: newId,
      title: `${original.title} (Copy)`,
      status: "draft",
      shortId: null,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://invitegenerator.com"}/i/${shortId}`,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
    };

    const putCommand = new PutCommand({
      TableName: process.env.DYNAMODB_INVITATIONS_TABLE,
      Item: duplicate,
    });

    await docClient.send(putCommand);

    return NextResponse.json({
      success: true,
      message: "Invitation duplicated successfully",
      data: duplicate,
    });
  } catch (error) {
    console.error("Duplicate invitation error:", error);
    return errorResponse("Failed to duplicate invitation", 500);
  }
}
