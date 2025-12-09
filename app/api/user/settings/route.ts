/**
 * User Settings API
 *
 * GET /api/user/settings - Get user settings
 * PATCH /api/user/settings - Update user settings
 */

import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getAuthenticatedUser } from "@/lib/auth";

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Valid timezones (subset for validation)
const VALID_LANGUAGES = ["en", "es", "fr", "de", "it", "pt", "ja", "zh", "ko"];

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { success: false, error: { code: "ERROR", message } },
    { status }
  );
}

/**
 * GET: Fetch user settings
 */
export async function GET() {
  const authResult = await getAuthenticatedUser();
  if (!authResult.success) {
    return errorResponse(authResult.error.message, 401);
  }
  const userId = authResult.user.userId;

  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: process.env.DYNAMODB_USERS_TABLE,
        Key: { id: userId },
        ProjectionExpression: "settings, consent",
      })
    );

    if (!result.Item) {
      return errorResponse("User not found", 404);
    }

    return NextResponse.json({
      success: true,
      data: {
        settings: result.Item.settings || {},
        consent: {
          marketingEmails: result.Item.consent?.marketingConsent ?? false,
          dataProcessing: result.Item.consent?.dataProcessingConsent ?? true,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return errorResponse("Failed to fetch settings", 500);
  }
}

/**
 * PATCH: Update user settings
 */
export async function PATCH(request: NextRequest) {
  const authResult = await getAuthenticatedUser();
  if (!authResult.success) {
    return errorResponse(authResult.error.message, 401);
  }
  const userId = authResult.user.userId;

  try {
    const body = await request.json();
    const {
      emailNotifications,
      rsvpReminders,
      marketingEmails,
      productRecommendations,
      partnerOffers,
      timezone,
      language,
      theme,
    } = body;

    // Build update expression for settings
    const settingsUpdates: Record<string, any> = {};
    const consentUpdates: Record<string, any> = {};
    const now = new Date().toISOString();

    if (emailNotifications !== undefined) {
      settingsUpdates["settings.emailNotifications"] = emailNotifications;
    }

    if (rsvpReminders !== undefined) {
      settingsUpdates["settings.rsvpReminders"] = rsvpReminders;
    }

    if (marketingEmails !== undefined) {
      settingsUpdates["settings.marketingEmails"] = marketingEmails;
      consentUpdates["consent.marketingConsent"] = marketingEmails;
      consentUpdates["consent.marketingConsentAt"] = now;
    }

    if (productRecommendations !== undefined) {
      settingsUpdates["settings.productRecommendations"] = productRecommendations;
    }

    if (partnerOffers !== undefined) {
      settingsUpdates["settings.partnerOffers"] = partnerOffers;
    }

    if (timezone !== undefined) {
      // Basic timezone validation
      if (typeof timezone !== "string" || timezone.length > 50) {
        return errorResponse("Invalid timezone");
      }
      settingsUpdates["settings.timezone"] = timezone;
    }

    if (language !== undefined) {
      if (!VALID_LANGUAGES.includes(language)) {
        return errorResponse(`Invalid language. Valid options: ${VALID_LANGUAGES.join(", ")}`);
      }
      settingsUpdates["settings.language"] = language;
    }

    if (theme !== undefined) {
      if (!["light", "dark", "system"].includes(theme)) {
        return errorResponse("Invalid theme. Valid options: light, dark, system");
      }
      settingsUpdates["settings.theme"] = theme;
    }

    // Build DynamoDB update expression
    const allUpdates = { ...settingsUpdates, ...consentUpdates };
    const updateExpressions = Object.keys(allUpdates).map((key) => `${key} = :${key.replace(/\./g, "_")}`);
    updateExpressions.push("updatedAt = :updatedAt");

    const expressionValues: Record<string, any> = {
      ":updatedAt": now,
    };

    Object.entries(allUpdates).forEach(([key, value]) => {
      expressionValues[`:${key.replace(/\./g, "_")}`] = value;
    });

    const result = await docClient.send(
      new UpdateCommand({
        TableName: process.env.DYNAMODB_USERS_TABLE,
        Key: { id: userId },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeValues: expressionValues,
        ReturnValues: "ALL_NEW",
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        settings: result.Attributes?.settings || {},
      },
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return errorResponse("Failed to update settings", 500);
  }
}
