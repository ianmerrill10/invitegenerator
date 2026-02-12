import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { verifyAuth } from "@/lib/auth-server";
import { applyRateLimit, API_RATE_LIMIT } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/security";

// ---------------------------------------------------------------------------
// DynamoDB setup (lazy-init pattern)
// ---------------------------------------------------------------------------

let _dynamoClient: DynamoDBClient | null = null;
let _docClient: DynamoDBDocumentClient | null = null;

function getDocClient(): DynamoDBDocumentClient {
  if (!_docClient) {
    _dynamoClient = new DynamoDBClient({
      region: process.env.AWS_REGION || "us-east-1",
    });
    _docClient = DynamoDBDocumentClient.from(_dynamoClient);
  }
  return _docClient;
}

const TABLE_NAME = process.env.DYNAMODB_QUESTIONNAIRES_TABLE || "InviteGenerator-Questionnaires-production";

// ---------------------------------------------------------------------------
// Allowed event types for validation
// ---------------------------------------------------------------------------

const ALLOWED_EVENT_TYPES = [
  "wedding",
  "birthday",
  "baby_shower",
  "bridal_shower",
  "anniversary",
  "graduation",
  "corporate",
  "holiday",
  "dinner_party",
  "cocktail_party",
  "retirement",
  "memorial",
  "religious",
  "fundraiser",
  "other",
] as const;

const ALLOWED_WEDDING_STYLES = [
  "traditional",
  "modern",
  "rustic",
  "bohemian",
  "luxury",
  "destination",
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: { code: "QUESTIONNAIRE_ERROR", message },
    },
    { status }
  );
}

function isValidEventType(value: unknown): boolean {
  return typeof value === "string" && (ALLOWED_EVENT_TYPES as readonly string[]).includes(value);
}

function isValidWeddingStyle(value: unknown): boolean {
  if (value === undefined || value === null) return true; // optional field
  return typeof value === "string" && (ALLOWED_WEDDING_STYLES as readonly string[]).includes(value);
}

// ---------------------------------------------------------------------------
// POST /api/questionnaire  - Save a completed questionnaire
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // Rate-limit
  const rateLimit = applyRateLimit(request, API_RATE_LIMIT);
  if (rateLimit.error) {
    return NextResponse.json(
      { success: false, error: { code: "RATE_LIMITED", message: rateLimit.error.message } },
      { status: rateLimit.error.status, headers: rateLimit.headers }
    );
  }

  try {
    // Auth - questionnaire can be submitted by authenticated users
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return errorResponse("Unauthorized", 401);
    }
    const userId = auth.userId;

    const body = await request.json();

    // Validate required fields
    const { invitationId, eventType } = body;
    if (!invitationId || typeof invitationId !== "string") {
      return errorResponse("invitationId is required");
    }
    if (!isValidEventType(eventType)) {
      return errorResponse("Invalid or missing eventType");
    }
    if (!isValidWeddingStyle(body.weddingStyle)) {
      return errorResponse("Invalid weddingStyle value");
    }

    const now = new Date().toISOString();
    const id = uuidv4();

    // Build the item, sanitising all free-text fields
    const item: Record<string, unknown> = {
      id,
      invitationId: sanitizeText(invitationId, 100),
      userId,
      eventType,
      eventDate: body.eventDate ? sanitizeText(String(body.eventDate), 30) : null,
      guestCount: typeof body.guestCount === "number" ? Math.max(0, Math.round(body.guestCount)) : null,
      estimatedBudget: typeof body.estimatedBudget === "number" ? Math.max(0, body.estimatedBudget) : null,
      venueBooked: Boolean(body.venueBooked),
      venueName: body.venueName ? sanitizeText(body.venueName, 200) : null,
      venueCity: body.venueCity ? sanitizeText(body.venueCity, 100) : null,
      venueState: body.venueState ? sanitizeText(body.venueState, 100) : null,

      // Vendor needs (booleans)
      needsPhotographer: Boolean(body.needsPhotographer),
      needsCatering: Boolean(body.needsCatering),
      needsFlorist: Boolean(body.needsFlorist),
      needsMusic: Boolean(body.needsMusic),
      needsVenue: Boolean(body.needsVenue),
      needsHoneymoon: Boolean(body.needsHoneymoon),

      // Wedding-specific
      weddingStyle: body.weddingStyle || null,
      weddingTheme: body.weddingTheme ? sanitizeText(body.weddingTheme, 200) : null,
      honeymoonDestination: body.honeymoonDestination ? sanitizeText(body.honeymoonDestination, 200) : null,
      honeymoonBudget: typeof body.honeymoonBudget === "number" ? Math.max(0, body.honeymoonBudget) : null,

      // Birthday-specific
      birthdayAge: typeof body.birthdayAge === "number" ? Math.max(0, Math.round(body.birthdayAge)) : null,
      birthdayTheme: body.birthdayTheme ? sanitizeText(body.birthdayTheme, 200) : null,

      // Gifts & travel
      giftRegistryInterest: Boolean(body.giftRegistryInterest),
      preferredGiftTypes: Array.isArray(body.preferredGiftTypes)
        ? body.preferredGiftTypes.slice(0, 20).map((t: unknown) => sanitizeText(String(t), 100))
        : null,
      outOfTownGuests: typeof body.outOfTownGuests === "number" ? Math.max(0, Math.round(body.outOfTownGuests)) : null,
      needsHotelBlock: Boolean(body.needsHotelBlock),

      // Additional
      hasChildren: Boolean(body.hasChildren),
      petFriendly: Boolean(body.petFriendly),
      dietaryRestrictions: Array.isArray(body.dietaryRestrictions)
        ? body.dietaryRestrictions.slice(0, 20).map((d: unknown) => sanitizeText(String(d), 100))
        : null,
      culturalTraditions: Array.isArray(body.culturalTraditions)
        ? body.culturalTraditions.slice(0, 20).map((c: unknown) => sanitizeText(String(c), 100))
        : null,

      completedAt: body.completedAt || now,
      createdAt: now,
      updatedAt: now,
    };

    // Persist to DynamoDB
    const docClient = getDocClient();
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Save questionnaire error:", error);
    return errorResponse("Failed to save questionnaire", 500);
  }
}

// ---------------------------------------------------------------------------
// GET /api/questionnaire?invitationId=xxx  - Retrieve questionnaire(s)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get("invitationId");

    if (!invitationId) {
      return errorResponse("invitationId query parameter is required");
    }

    const docClient = getDocClient();

    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "invitationId-index",
        KeyConditionExpression: "invitationId = :iid",
        ExpressionAttributeValues: {
          ":iid": invitationId,
        },
        ScanIndexForward: false,
      })
    );

    // Filter to only return questionnaires owned by this user
    const items = (result.Items || []).filter(
      (item) => item.userId === auth.userId
    );

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Get questionnaire error:", error);
    return errorResponse("Failed to retrieve questionnaire", 500);
  }
}
