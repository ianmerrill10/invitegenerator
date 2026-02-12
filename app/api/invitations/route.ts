import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
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

// GET /api/invitations - List user's invitations
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return errorResponse("Unauthorized", 401);
    }
    const userId = auth.userId;

    // Query invitations by user ID
    const queryCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_INVITATIONS_TABLE,
      IndexName: "userId-index",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
      ScanIndexForward: false, // Newest first
    });

    const result = await docClient.send(queryCommand);

    return NextResponse.json({
      success: true,
      data: result.Items || [],
    });
  } catch (error) {
    console.error("Get invitations error:", error);
    return errorResponse("Failed to fetch invitations", 500);
  }
}

// POST /api/invitations - Create new invitation
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimit = applyRateLimit(request, API_RATE_LIMIT);
  if (rateLimit.error) {
    return NextResponse.json(
      { success: false, error: { code: "RATE_LIMITED", message: rateLimit.error.message } },
      { status: rateLimit.error.status, headers: rateLimit.headers }
    );
  }

  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return errorResponse("Unauthorized", 401);
    }
    const userId = auth.userId;

    const body = await request.json();
    const {
      title,
      eventType,
      eventDate,
      eventTime,
      location,
      description,
      hostName,
      templateId,
    } = body;

    // Validate required fields
    if (!title || !eventType || !eventDate || !hostName || !location?.name) {
      return errorResponse("Missing required fields");
    }

    // Validate input lengths
    if (title.length > 200) {
      return errorResponse("Title must be less than 200 characters");
    }
    if (hostName.length > 100) {
      return errorResponse("Host name must be less than 100 characters");
    }
    if (description && description.length > 2000) {
      return errorResponse("Description must be less than 2000 characters");
    }

    // Generate IDs
    const invitationId = uuidv4();
    const shortId = invitationId.slice(0, 8);
    const now = new Date().toISOString();

    // Create invitation object with sanitized inputs
    const invitation = {
      id: invitationId,
      userId,
      title: sanitizeText(title, 200),
      eventType: sanitizeText(eventType, 50),
      eventDate,
      eventTime: eventTime || null,
      location: {
        name: sanitizeText(location.name, 200),
        address: location.address ? sanitizeText(location.address, 500) : null,
        city: location.city ? sanitizeText(location.city, 100) : null,
        state: location.state ? sanitizeText(location.state, 100) : null,
        zipCode: location.zipCode ? sanitizeText(location.zipCode, 20) : null,
        country: location.country ? sanitizeText(location.country, 100) : null,
        virtual: Boolean(location.virtual),
        virtualLink: location.virtualLink ? sanitizeText(location.virtualLink, 500) : null,
        mapUrl: location.address
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              location.address
            )}`
          : null,
      },
      description: description ? sanitizeText(description, 2000) : null,
      hostName: sanitizeText(hostName, 100),
      hostEmail: null, // Will be set from user profile
      designData: {
        templateId: templateId || "default",
        backgroundColor: "#FFFFFF",
        primaryColor: "#EC4899",
        secondaryColor: "#64748B",
        accentColor: "#FCD34D",
        fontFamily: "Inter",
        headingFont: "Playfair Display",
        fontSize: 16,
        textColor: "#1C1917",
        layout: "classic",
        elements: [],
        width: 800,
        height: 1120,
      },
      rsvpSettings: {
        enabled: true,
        deadline: null,
        maxGuests: 50,
        allowPlusOne: false,
        plusOneLimit: 1,
        collectMealPreference: false,
        mealOptions: [],
        collectDietaryRestrictions: false,
        customQuestions: [],
        requireMessage: false,
        sendConfirmationEmail: true,
        sendReminderEmail: true,
        reminderDaysBefore: 7,
      },
      status: "draft",
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://invitegenerator.com"}/i/${shortId}`,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
    };

    // Save to DynamoDB
    const putCommand = new PutCommand({
      TableName: process.env.DYNAMODB_INVITATIONS_TABLE,
      Item: invitation,
    });

    await docClient.send(putCommand);

    return NextResponse.json({
      success: true,
      data: invitation,
    });
  } catch (error) {
    console.error("Create invitation error:", error);
    return errorResponse("Failed to create invitation", 500);
  }
}
