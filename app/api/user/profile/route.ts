/**
 * User Profile API
 *
 * GET /api/user/profile - Get current user's profile
 * PATCH /api/user/profile - Update profile fields
 */

import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Helper to get user ID from token
async function getUserFromToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("id_token")?.value;
  if (!token) {
    // Try user_id cookie (from social login)
    const userId = cookieStore.get("user_id")?.value;
    return userId || null;
  }
  try {
    const decoded = jwt.decode(token) as { sub?: string };
    return decoded?.sub || null;
  } catch {
    return null;
  }
}

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { success: false, error: { code: "ERROR", message } },
    { status }
  );
}

/**
 * GET: Fetch user profile
 */
export async function GET() {
  const userId = await getUserFromToken();
  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: process.env.DYNAMODB_USERS_TABLE,
        Key: { id: userId },
      })
    );

    if (!result.Item) {
      return errorResponse("User not found", 404);
    }

    // Remove sensitive fields
    const { settings, consent, socialLogins, ...profile } = result.Item;

    return NextResponse.json({
      success: true,
      data: {
        ...profile,
        // Include non-sensitive settings
        settings: {
          timezone: settings?.timezone,
          language: settings?.language,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return errorResponse("Failed to fetch profile", 500);
  }
}

/**
 * PATCH: Update user profile
 */
export async function PATCH(request: NextRequest) {
  const userId = await getUserFromToken();
  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    const { name, avatarUrl, phone, company, website, bio } = body;

    // Build update expression
    const updateExpressions: string[] = ["updatedAt = :updatedAt"];
    const expressionValues: Record<string, any> = {
      ":updatedAt": new Date().toISOString(),
    };

    if (name !== undefined) {
      if (name.length < 2) {
        return errorResponse("Name must be at least 2 characters");
      }
      updateExpressions.push("#name = :name");
      expressionValues[":name"] = name;
    }

    if (avatarUrl !== undefined) {
      updateExpressions.push("avatarUrl = :avatarUrl");
      expressionValues[":avatarUrl"] = avatarUrl;
    }

    if (phone !== undefined) {
      updateExpressions.push("phone = :phone");
      expressionValues[":phone"] = phone;
    }

    if (company !== undefined) {
      updateExpressions.push("company = :company");
      expressionValues[":company"] = company;
    }

    if (website !== undefined) {
      updateExpressions.push("website = :website");
      expressionValues[":website"] = website;
    }

    if (bio !== undefined) {
      if (bio.length > 500) {
        return errorResponse("Bio must be 500 characters or less");
      }
      updateExpressions.push("bio = :bio");
      expressionValues[":bio"] = bio;
    }

    const result = await docClient.send(
      new UpdateCommand({
        TableName: process.env.DYNAMODB_USERS_TABLE,
        Key: { id: userId },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeValues: expressionValues,
        ExpressionAttributeNames: name !== undefined ? { "#name": "name" } : undefined,
        ReturnValues: "ALL_NEW",
      })
    );

    // Remove sensitive fields from response
    const { settings, consent, socialLogins, ...profile } = result.Attributes || {};

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return errorResponse("Failed to update profile", 500);
  }
}
