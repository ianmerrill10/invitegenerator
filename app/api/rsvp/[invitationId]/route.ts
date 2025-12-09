import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { getAuthenticatedUser } from "@/lib/auth";
import { checkRateLimit, rateLimitResponse, rateLimiters } from "@/lib/rate-limit";

// Initialize DynamoDB
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

interface RSVPSubmission {
  name: string;
  email: string;
  phone?: string;
  attending: "yes" | "no" | "maybe";
  guestCount: number;
  guestNames?: string[];
  dietaryRestrictions?: string;
  message?: string;
  customAnswers?: Record<string, string | boolean>;
}

// Sanitize text to prevent XSS
function sanitizeText(text: string): string {
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// Validate RSVP submission
function validateRSVPSubmission(body: RSVPSubmission): string | null {
  if (!body.name || body.name.trim().length < 2) {
    return "Name is required (minimum 2 characters)";
  }
  if (body.name.length > 100) {
    return "Name is too long (maximum 100 characters)";
  }
  if (!body.email) {
    return "Email is required";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return "Please enter a valid email address";
  }
  if (!["yes", "no", "maybe"].includes(body.attending)) {
    return "Invalid attendance response";
  }
  if (body.guestCount !== undefined && (body.guestCount < 0 || body.guestCount > 20)) {
    return "Invalid guest count";
  }
  if (body.message && body.message.length > 500) {
    return "Message is too long (maximum 500 characters)";
  }
  return null;
}

// Get client IP
function getClientIP(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || null;
}

function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    { success: false, error: { code: "RSVP_ERROR", message } },
    { status }
  );
}

// POST /api/rsvp/[invitationId] - Submit RSVP (public)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  // Apply rate limiting for RSVP submissions
  const rateLimitResult = checkRateLimit(request, rateLimiters.rsvp);
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult, rateLimiters.rsvp.message);
  }

  try {
    const { invitationId } = await params;

    // Parse and validate request body
    const body: RSVPSubmission = await request.json();
    const validationError = validateRSVPSubmission(body);
    if (validationError) {
      return errorResponse(validationError);
    }

    // Fetch invitation
    const getCommand = new GetCommand({
      TableName: process.env.DYNAMODB_INVITATIONS_TABLE,
      Key: { id: invitationId },
    });

    const invitationResult = await docClient.send(getCommand);

    if (!invitationResult.Item) {
      return errorResponse("Invitation not found", 404);
    }

    const invitation = invitationResult.Item;

    // Check if invitation is published
    if (invitation.status !== "published") {
      return errorResponse("This invitation is not available", 410);
    }

    // Check if RSVP is enabled
    const rsvpSettings = invitation.rsvpSettings || {};
    if (rsvpSettings.enabled === false) {
      return errorResponse("RSVP is not enabled for this invitation");
    }

    // Check deadline
    if (rsvpSettings.deadline && new Date(rsvpSettings.deadline) < new Date()) {
      return errorResponse("RSVP deadline has passed", 410);
    }

    // Check for existing RSVP by email
    const existingQuery = new QueryCommand({
      TableName: process.env.DYNAMODB_RSVP_TABLE,
      IndexName: "invitationId-index",
      KeyConditionExpression: "invitationId = :invitationId",
      FilterExpression: "email = :email",
      ExpressionAttributeValues: {
        ":invitationId": invitationId,
        ":email": body.email.toLowerCase(),
      },
      Limit: 1,
    });

    const existingResult = await docClient.send(existingQuery);

    // If exists, update instead of create
    if (existingResult.Items && existingResult.Items.length > 0) {
      const existingRsvp = existingResult.Items[0];
      const now = new Date().toISOString();

      const updateCommand = new UpdateCommand({
        TableName: process.env.DYNAMODB_RSVP_TABLE,
        Key: { id: existingRsvp.id },
        UpdateExpression: `SET
          #name = :name,
          attending = :attending,
          guestCount = :guestCount,
          dietaryRestrictions = :dietary,
          message = :message,
          updatedAt = :now
        `,
        ExpressionAttributeNames: {
          "#name": "name",
        },
        ExpressionAttributeValues: {
          ":name": sanitizeText(body.name.trim()),
          ":attending": body.attending,
          ":guestCount": body.attending === "yes" ? Math.max(1, body.guestCount || 1) : 0,
          ":dietary": body.dietaryRestrictions ? sanitizeText(body.dietaryRestrictions) : null,
          ":message": body.message ? sanitizeText(body.message.slice(0, 500)) : null,
          ":now": now,
        },
        ReturnValues: "ALL_NEW",
      });

      await docClient.send(updateCommand);

      return NextResponse.json({
        success: true,
        rsvpId: existingRsvp.id,
        message: "RSVP updated successfully",
        updated: true,
      });
    }

    // Create new RSVP
    const rsvpId = uuidv4();
    const now = new Date().toISOString();

    const rsvp = {
      id: rsvpId,
      invitationId,
      name: sanitizeText(body.name.trim()),
      email: body.email.toLowerCase().trim(),
      phone: body.phone ? sanitizeText(body.phone.trim()) : null,
      attending: body.attending,
      guestCount: body.attending === "yes" ? Math.max(1, body.guestCount || 1) : 0,
      guestNames: body.guestNames?.map((n) => sanitizeText(n.trim())).filter((n) => n) || [],
      dietaryRestrictions: body.dietaryRestrictions ? sanitizeText(body.dietaryRestrictions) : null,
      message: body.message ? sanitizeText(body.message.slice(0, 500)) : null,
      customAnswers: body.customAnswers || {},
      createdAt: now,
      updatedAt: now,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get("user-agent")?.slice(0, 500) || null,
    };

    const putCommand = new PutCommand({
      TableName: process.env.DYNAMODB_RSVP_TABLE,
      Item: rsvp,
    });

    await docClient.send(putCommand);

    return NextResponse.json({
      success: true,
      rsvpId,
      message: "RSVP submitted successfully",
    });
  } catch (error) {
    console.error("Submit RSVP error:", error);
    return errorResponse("Failed to submit RSVP", 500);
  }
}

// GET /api/rsvp/[invitationId] - Get RSVPs for invitation (requires auth)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  try {
    const { invitationId } = await params;
    const authResult = await getAuthenticatedUser();
    if (!authResult.success) {
      return errorResponse(authResult.error.message, 401);
    }
    const userId = authResult.user.userId;

    // Verify user owns invitation
    const getInvitation = new GetCommand({
      TableName: process.env.DYNAMODB_INVITATIONS_TABLE,
      Key: { id: invitationId },
    });

    const invitationResult = await docClient.send(getInvitation);

    if (!invitationResult.Item) {
      return errorResponse("Invitation not found", 404);
    }

    if (invitationResult.Item.userId !== userId) {
      return errorResponse("Forbidden", 403);
    }

    // Get RSVPs
    const queryCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_RSVP_TABLE,
      IndexName: "invitationId-index",
      KeyConditionExpression: "invitationId = :invitationId",
      ExpressionAttributeValues: {
        ":invitationId": invitationId,
      },
      ScanIndexForward: false,
    });

    const result = await docClient.send(queryCommand);
    const rsvps = result.Items || [];

    // Calculate stats
    const summary = {
      total: rsvps.length,
      attending: rsvps.filter((r) => r.attending === "yes").length,
      notAttending: rsvps.filter((r) => r.attending === "no").length,
      maybe: rsvps.filter((r) => r.attending === "maybe").length,
      totalGuests: rsvps
        .filter((r) => r.attending === "yes")
        .reduce((sum, r) => sum + (r.guestCount || 1), 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        responses: rsvps,
        summary,
      },
    });
  } catch (error) {
    console.error("Get RSVPs error:", error);
    return errorResponse("Failed to fetch RSVPs", 500);
  }
}
