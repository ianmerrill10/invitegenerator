import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { getAuthenticatedUser } from "@/lib/auth";

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
    const authResult = await getAuthenticatedUser();
    if (!authResult.success) {
      return errorResponse(authResult.error.message, 401);
    }
    const userId = authResult.user.userId;

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
  try {
    const authResult = await getAuthenticatedUser();
    if (!authResult.success) {
      return errorResponse(authResult.error.message, 401);
    }
    const userId = authResult.user.userId;

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

    // Generate IDs
    const invitationId = uuidv4();
    const shortId = invitationId.slice(0, 8);
    const now = new Date().toISOString();

    // Create invitation object
    const invitation = {
      id: invitationId,
      userId,
      title,
      eventType,
      eventDate,
      eventTime: eventTime || null,
      location: {
        name: location.name,
        address: location.address || null,
        city: location.city || null,
        state: location.state || null,
        zipCode: location.zipCode || null,
        country: location.country || null,
        virtual: location.virtual || false,
        virtualLink: location.virtualLink || null,
        mapUrl: location.address
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              location.address
            )}`
          : null,
      },
      description: description || null,
      hostName,
      hostEmail: null, // Will be set from user profile
      designData: {
        templateId: templateId || "default",
        backgroundColor: "#FFFFFF",
        primaryColor: "#FF6B47",
        secondaryColor: "#14B8A6",
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
