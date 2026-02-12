import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { verifyAuth } from "@/lib/auth-server";
import { applyRateLimit, API_RATE_LIMIT } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/security";

// Initialize DynamoDB
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

const REGISTRY_TABLE = process.env.DYNAMODB_REGISTRY_TABLE || "InviteGenerator-Registry-production";

// Helper to create error response
function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: { code: "REGISTRY_ERROR", message },
    },
    { status }
  );
}

// GET /api/registry - List user's registries OR fetch by customUrl (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customUrl = searchParams.get("customUrl");

    // Public lookup by customUrl
    if (customUrl) {
      const scanCommand = new ScanCommand({
        TableName: REGISTRY_TABLE,
        FilterExpression: "customUrl = :customUrl AND isActive = :isActive",
        ExpressionAttributeValues: {
          ":customUrl": customUrl,
          ":isActive": true,
        },
      });

      const result = await docClient.send(scanCommand);

      if (!result.Items || result.Items.length === 0) {
        return errorResponse("Registry not found", 404);
      }

      const registry = result.Items[0];

      // Strip sensitive fields for public view
      const publicRegistry = {
        ...registry,
        settings: {
          ...registry.settings,
          password: undefined,
        },
      };

      return NextResponse.json({
        success: true,
        data: publicRegistry,
      });
    }

    // Authenticated user listing
    const auth = (await verifyAuth(request)) as {
      authenticated: boolean;
      userId: string | null;
    };
    if (!auth.authenticated || !auth.userId) {
      return errorResponse("Unauthorized", 401);
    }
    const userId = auth.userId;

    const queryCommand = new QueryCommand({
      TableName: REGISTRY_TABLE,
      IndexName: "userId-index",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
      ScanIndexForward: false,
    });

    const result = await docClient.send(queryCommand);

    return NextResponse.json({
      success: true,
      data: result.Items || [],
    });
  } catch (error) {
    console.error("Get registries error:", error);
    return errorResponse("Failed to fetch registries", 500);
  }
}

// POST /api/registry - Create new registry
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimit = applyRateLimit(request, API_RATE_LIMIT);
  if (rateLimit.error) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "RATE_LIMITED", message: rateLimit.error.message },
      },
      { status: rateLimit.error.status, headers: rateLimit.headers }
    );
  }

  try {
    const auth = (await verifyAuth(request)) as {
      authenticated: boolean;
      userId: string | null;
    };
    if (!auth.authenticated || !auth.userId) {
      return errorResponse("Unauthorized", 401);
    }
    const userId = auth.userId;

    const body = await request.json();
    const { eventId, type, title, description, customUrl, settings } = body;

    // Validate required fields
    if (!title || !type || !eventId) {
      return errorResponse("Missing required fields: title, type, and eventId are required");
    }

    // Validate input lengths
    if (title.length > 200) {
      return errorResponse("Title must be less than 200 characters");
    }
    if (description && description.length > 2000) {
      return errorResponse("Description must be less than 2000 characters");
    }
    if (customUrl && customUrl.length > 100) {
      return errorResponse("Custom URL must be less than 100 characters");
    }

    // Validate customUrl format
    if (customUrl && !/^[a-z0-9-]+$/.test(customUrl)) {
      return errorResponse(
        "Custom URL may only contain lowercase letters, numbers, and hyphens"
      );
    }

    // Check customUrl uniqueness if provided
    if (customUrl) {
      const existingCheck = new ScanCommand({
        TableName: REGISTRY_TABLE,
        FilterExpression: "customUrl = :customUrl",
        ExpressionAttributeValues: {
          ":customUrl": customUrl,
        },
      });

      const existing = await docClient.send(existingCheck);
      if (existing.Items && existing.Items.length > 0) {
        return errorResponse("This custom URL is already taken. Please choose another.");
      }
    }

    // Generate IDs
    const registryId = uuidv4();
    const now = new Date().toISOString();
    const generatedCustomUrl = customUrl || `registry-${registryId.slice(0, 8)}`;

    // Default settings
    const defaultSettings = {
      allowAnonymousGifts: true,
      showPrices: true,
      showProgress: true,
      showContributorNames: false,
      allowPartialContributions: true,
      allowMessages: true,
      thankYouMessage: "",
      privacyLevel: "public",
      notifyOnPurchase: true,
      notifyOnContribution: true,
      theme: {
        primaryColor: "#EC4899",
        secondaryColor: "#64748B",
        fontFamily: "Inter",
        backgroundStyle: "solid",
        backgroundValue: "#FAFAFA",
      },
    };

    // Create registry object with sanitized inputs
    const registry = {
      id: registryId,
      userId,
      eventId: sanitizeText(eventId, 100),
      type: sanitizeText(type, 50),
      title: sanitizeText(title, 200),
      description: description ? sanitizeText(description, 2000) : "",
      personalMessage: null,
      coverImageUrl: null,
      items: [],
      settings: {
        ...defaultSettings,
        ...(settings || {}),
        thankYouMessage: settings?.thankYouMessage
          ? sanitizeText(settings.thankYouMessage, 500)
          : defaultSettings.thankYouMessage,
      },
      stats: {
        totalItems: 0,
        itemsFulfilled: 0,
        totalValue: 0,
        valueFulfilled: 0,
        uniqueContributors: 0,
        views: 0,
        conversionRate: 0,
        affiliateEarnings: 0,
        lastActivityAt: now,
      },
      customUrl: generatedCustomUrl,
      isActive: true,
      expiresAt: null,
      shareUrl: `${
        process.env.NEXT_PUBLIC_APP_URL || "https://invitegenerator.com"
      }/registry/${generatedCustomUrl}`,
      createdAt: now,
      updatedAt: now,
    };

    // Save to DynamoDB
    const putCommand = new PutCommand({
      TableName: REGISTRY_TABLE,
      Item: registry,
    });

    await docClient.send(putCommand);

    return NextResponse.json({
      success: true,
      data: registry,
    });
  } catch (error) {
    console.error("Create registry error:", error);
    return errorResponse("Failed to create registry", 500);
  }
}
