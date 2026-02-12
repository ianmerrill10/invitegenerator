import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || "InviteGenerator-Users-production";

interface UserPreferences {
  theme: "light" | "dark" | "system";
  emailNotifications: {
    rsvpAlerts: boolean;
    weeklyDigest: boolean;
    marketingEmails: boolean;
    productUpdates: boolean;
  };
  editorSettings: {
    showGrid: boolean;
    snapToGrid: boolean;
    gridSize: number;
    autoSave: boolean;
    autoSaveInterval: number;
  };
  defaultInvitationSettings: {
    rsvpEnabled: boolean;
    guestLimit: number | null;
    requireEmail: boolean;
    allowPlusOnes: boolean;
  };
  locale: string;
  timezone: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "system",
  emailNotifications: {
    rsvpAlerts: true,
    weeklyDigest: true,
    marketingEmails: false,
    productUpdates: true,
  },
  editorSettings: {
    showGrid: true,
    snapToGrid: true,
    gridSize: 10,
    autoSave: true,
    autoSaveInterval: 30,
  },
  defaultInvitationSettings: {
    rsvpEnabled: true,
    guestLimit: null,
    requireEmail: true,
    allowPlusOnes: true,
  },
  locale: "en-US",
  timezone: "America/New_York",
};

// GET /api/user/preferences - Get user preferences
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const userResult = await dynamodb.send(
      new GetItemCommand({
        TableName: USERS_TABLE,
        Key: marshall({ id: auth.userId }),
        ProjectionExpression: "preferences",
      })
    );

    const user = userResult.Item ? unmarshall(userResult.Item) : null;
    const preferences = {
      ...DEFAULT_PREFERENCES,
      ...(user?.preferences || {}),
    };

    return NextResponse.json({
      success: true,
      data: { preferences },
    });
  } catch (error) {
    console.error("Get preferences error:", error);
    return NextResponse.json(
      { success: false, error: { code: "FETCH_FAILED", message: "Failed to fetch preferences" } },
      { status: 500 }
    );
  }
}

// PATCH /api/user/preferences - Update user preferences
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Get current preferences
    const userResult = await dynamodb.send(
      new GetItemCommand({
        TableName: USERS_TABLE,
        Key: marshall({ id: auth.userId }),
        ProjectionExpression: "preferences",
      })
    );

    const user = userResult.Item ? unmarshall(userResult.Item) : null;
    const currentPreferences = user?.preferences || {};

    // Deep merge preferences
    const updatedPreferences = deepMerge(
      deepMerge(DEFAULT_PREFERENCES as unknown as Record<string, unknown>, currentPreferences),
      body
    ) as unknown as UserPreferences;

    // Validate preferences
    if (updatedPreferences.editorSettings?.gridSize < 5) {
      updatedPreferences.editorSettings.gridSize = 5;
    }
    if (updatedPreferences.editorSettings?.gridSize > 50) {
      updatedPreferences.editorSettings.gridSize = 50;
    }
    if (updatedPreferences.editorSettings?.autoSaveInterval < 10) {
      updatedPreferences.editorSettings.autoSaveInterval = 10;
    }

    // Save preferences
    await dynamodb.send(
      new UpdateItemCommand({
        TableName: USERS_TABLE,
        Key: marshall({ id: auth.userId }),
        UpdateExpression: "SET preferences = :preferences, updatedAt = :updatedAt",
        ExpressionAttributeValues: marshall({
          ":preferences": updatedPreferences,
          ":updatedAt": new Date().toISOString(),
        }),
      })
    );

    return NextResponse.json({
      success: true,
      data: { preferences: updatedPreferences },
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_FAILED", message: "Failed to update preferences" } },
      { status: 500 }
    );
  }
}

function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === "object" &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof target[key] === "object" &&
        target[key] !== null
      ) {
        result[key] = deepMerge(
          target[key] as Record<string, unknown>,
          source[key] as Record<string, unknown>
        ) as T[Extract<keyof T, string>];
      } else {
        result[key] = source[key] as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}
