/**
 * Consent API
 *
 * Stores user consent preferences for GDPR/CCPA compliance.
 * Records consent with timestamps for audit trail.
 */

import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { cookies } from "next/headers";

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

interface ConsentRecord {
  type: "cookies" | "marketing" | "data_processing";
  preferences: Record<string, boolean>;
  source?: string;
}

/**
 * POST: Record consent preferences
 */
export async function POST(request: NextRequest) {
  try {
    const body: ConsentRecord = await request.json();
    const { type, preferences, source } = body;

    if (!type || !preferences) {
      return NextResponse.json(
        { error: "Missing type or preferences" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Get user ID if logged in
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    // Create consent record for audit trail
    const consentRecord = {
      id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userId || "anonymous",
      type,
      preferences,
      timestamp: now,
      ipAddress,
      userAgent,
      source: source || "web",
      version: "1.0",
    };

    // Store in consent log table
    await docClient.send(
      new PutCommand({
        TableName: process.env.DYNAMODB_CONSENT_TABLE || "invitegen-consent-log",
        Item: consentRecord,
      })
    );

    // If user is logged in, update their preferences
    if (userId) {
      const updateExpression = [];
      const expressionValues: Record<string, any> = {
        ":updatedAt": now,
      };

      if (type === "cookies") {
        updateExpression.push("consent.cookies = :cookies");
        updateExpression.push("consent.cookiesUpdatedAt = :cookiesUpdatedAt");
        expressionValues[":cookies"] = preferences;
        expressionValues[":cookiesUpdatedAt"] = now;
      } else if (type === "marketing") {
        updateExpression.push("consent.marketing = :marketing");
        updateExpression.push("consent.marketingUpdatedAt = :marketingUpdatedAt");
        updateExpression.push("settings.marketingEmails = :marketingEmails");
        updateExpression.push("settings.productRecommendations = :productRecs");
        updateExpression.push("settings.partnerOffers = :partnerOffers");
        expressionValues[":marketing"] = preferences;
        expressionValues[":marketingUpdatedAt"] = now;
        expressionValues[":marketingEmails"] = preferences.emailMarketing ?? false;
        expressionValues[":productRecs"] = preferences.productRecommendations ?? false;
        expressionValues[":partnerOffers"] = preferences.partnerOffers ?? false;
      }

      if (updateExpression.length > 0) {
        try {
          await docClient.send(
            new UpdateCommand({
              TableName: process.env.DYNAMODB_USERS_TABLE,
              Key: { id: userId },
              UpdateExpression: `SET ${updateExpression.join(", ")}, updatedAt = :updatedAt`,
              ExpressionAttributeValues: expressionValues,
            })
          );
        } catch (updateError) {
          console.error("Error updating user consent:", updateError);
          // Continue - consent was logged
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        consentId: consentRecord.id,
        timestamp: now,
      },
    });
  } catch (error) {
    console.error("Consent API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record consent" },
      { status: 500 }
    );
  }
}

/**
 * GET: Retrieve current consent preferences
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    // Get cookie consent from cookie
    const cookieConsent = cookieStore.get("cookie_consent")?.value;
    let cookiePreferences = null;
    if (cookieConsent) {
      try {
        cookiePreferences = JSON.parse(cookieConsent);
      } catch {
        // Invalid cookie consent
      }
    }

    // If not logged in, return only cookie consent
    if (!userId) {
      return NextResponse.json({
        success: true,
        data: {
          cookies: cookiePreferences,
          marketing: null,
        },
      });
    }

    // Get user's stored consent from database
    // This would be a GetCommand in production
    return NextResponse.json({
      success: true,
      data: {
        cookies: cookiePreferences,
        marketing: {
          emailMarketing: true,
          productRecommendations: true,
          partnerOffers: true,
          eventReminders: true,
          dataSharing: false,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching consent:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch consent" },
      { status: 500 }
    );
  }
}
