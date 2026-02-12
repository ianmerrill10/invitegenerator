import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || "InviteGenerator-Users-production";

// GET /api/templates/favorites - Get user's favorite templates
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    // Get user's favorites from their record
    const userResult = await dynamodb.send(
      new GetItemCommand({
        TableName: USERS_TABLE,
        Key: marshall({ id: auth.userId }),
        ProjectionExpression: "favoriteTemplates",
      })
    );

    const user = userResult.Item ? unmarshall(userResult.Item) : null;
    const favorites = user?.favoriteTemplates || [];

    return NextResponse.json({
      success: true,
      data: { favorites },
    });
  } catch (error) {
    console.error("Get favorites error:", error);
    return NextResponse.json(
      { success: false, error: { code: "FETCH_FAILED", message: "Failed to fetch favorites" } },
      { status: 500 }
    );
  }
}

// POST /api/templates/favorites - Add or remove a favorite
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
    const { templateId, action } = body;

    if (!templateId || !["add", "remove"].includes(action)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "Invalid request" } },
        { status: 400 }
      );
    }

    // Get current favorites
    const userResult = await dynamodb.send(
      new GetItemCommand({
        TableName: USERS_TABLE,
        Key: marshall({ id: auth.userId }),
        ProjectionExpression: "favoriteTemplates",
      })
    );

    const user = userResult.Item ? unmarshall(userResult.Item) : null;
    let favorites: string[] = user?.favoriteTemplates || [];

    // Update favorites
    if (action === "add" && !favorites.includes(templateId)) {
      favorites.push(templateId);
    } else if (action === "remove") {
      favorites = favorites.filter((id) => id !== templateId);
    }

    // Save updated favorites
    await dynamodb.send(
      new UpdateItemCommand({
        TableName: USERS_TABLE,
        Key: marshall({ id: auth.userId }),
        UpdateExpression: "SET favoriteTemplates = :favorites, updatedAt = :updatedAt",
        ExpressionAttributeValues: marshall({
          ":favorites": favorites,
          ":updatedAt": new Date().toISOString(),
        }),
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        favorites,
        action,
        templateId,
      },
    });
  } catch (error) {
    console.error("Update favorites error:", error);
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_FAILED", message: "Failed to update favorites" } },
      { status: 500 }
    );
  }
}
