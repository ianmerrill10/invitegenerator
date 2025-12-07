import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    { success: false, error: { code: "INVITATION_ERROR", message } },
    { status }
  );
}

// GET /api/public/invitation/[shortId] - Get public invitation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortId: string }> }
) {
  try {
    const { shortId } = await params;

    if (!shortId || shortId.length < 4) {
      return errorResponse("Invalid invitation link", 400);
    }

    // Query by shortId
    const queryCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_INVITATIONS_TABLE,
      IndexName: "shortId-index",
      KeyConditionExpression: "shortId = :shortId",
      ExpressionAttributeValues: {
        ":shortId": shortId,
      },
      Limit: 1,
    });

    const result = await docClient.send(queryCommand);

    if (!result.Items || result.Items.length === 0) {
      return errorResponse("Invitation not found", 404);
    }

    const invitation = result.Items[0];

    // Check if published
    if (invitation.status !== "published") {
      return errorResponse("This invitation is no longer available", 410);
    }

    // Increment view count (fire and forget)
    const updateCommand = new UpdateCommand({
      TableName: process.env.DYNAMODB_INVITATIONS_TABLE,
      Key: { id: invitation.id },
      UpdateExpression: "SET viewCount = if_not_exists(viewCount, :zero) + :inc",
      ExpressionAttributeValues: {
        ":zero": 0,
        ":inc": 1,
      },
    });

    docClient.send(updateCommand).catch(console.error);

    // Return public-safe data
    const publicData = {
      id: invitation.id,
      title: invitation.title,
      description: invitation.description,
      eventType: invitation.eventType,
      eventDate: invitation.eventDate,
      eventTime: invitation.eventTime,
      eventEndDate: invitation.eventEndDate,
      eventEndTime: invitation.eventEndTime,
      location: invitation.location,
      hostName: invitation.hostName,
      designData: invitation.designData,
      rsvpSettings: {
        enabled: invitation.rsvpSettings?.enabled ?? true,
        deadline: invitation.rsvpSettings?.deadline,
        allowPlusOne: invitation.rsvpSettings?.allowPlusOne,
        plusOneLimit: invitation.rsvpSettings?.plusOneLimit,
        collectMealPreference: invitation.rsvpSettings?.collectMealPreference,
        mealOptions: invitation.rsvpSettings?.mealOptions,
        collectDietaryRestrictions: invitation.rsvpSettings?.collectDietaryRestrictions,
        customQuestions: invitation.rsvpSettings?.customQuestions,
      },
    };

    return NextResponse.json({
      success: true,
      data: publicData,
    });
  } catch (error) {
    console.error("Get public invitation error:", error);
    return errorResponse("Failed to load invitation", 500);
  }
}
