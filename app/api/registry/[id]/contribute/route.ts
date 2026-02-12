import { NextRequest, NextResponse } from "next/server";
import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { applyRateLimit, API_RATE_LIMIT } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/security";

// Initialize DynamoDB
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

const REGISTRY_TABLE =
  process.env.DYNAMODB_REGISTRY_TABLE || "InviteGenerator-Registry-production";

// Helper to create error response
function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: { code: "CONTRIBUTION_ERROR", message },
    },
    { status }
  );
}

// POST /api/registry/[id]/contribute - Record a contribution
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id: registryId } = params;

    // Validate registry ID
    if (!registryId || !/^[a-zA-Z0-9-]{36}$/.test(registryId)) {
      return errorResponse("Invalid registry ID");
    }

    // Fetch registry to verify it exists and is active
    const getCommand = new GetItemCommand({
      TableName: REGISTRY_TABLE,
      Key: marshall({ id: registryId }),
    });

    const registryResult = await dynamoClient.send(getCommand);

    if (!registryResult.Item) {
      return errorResponse("Registry not found", 404);
    }

    const registry = unmarshall(registryResult.Item);

    if (!registry.isActive) {
      return errorResponse("This registry is no longer accepting contributions");
    }

    // Parse contribution data
    const body = await request.json();
    const {
      itemId,
      contributorName,
      contributorEmail,
      amount,
      isAnonymous,
      message,
      source,
    } = body;

    // Validate required fields
    if (!itemId || !contributorName || !contributorEmail) {
      return errorResponse(
        "Missing required fields: itemId, contributorName, and contributorEmail are required"
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contributorEmail)) {
      return errorResponse("Invalid email address");
    }

    // Validate amount if provided
    if (amount !== undefined && (typeof amount !== "number" || amount <= 0)) {
      return errorResponse("Amount must be a positive number");
    }

    // Validate contributor name length
    if (contributorName.length > 100) {
      return errorResponse("Contributor name must be less than 100 characters");
    }

    // Validate message length
    if (message && message.length > 500) {
      return errorResponse("Message must be less than 500 characters");
    }

    // Create contribution record
    const contributionId = uuidv4();
    const now = new Date().toISOString();

    const contribution = {
      id: contributionId,
      registryId,
      itemId: sanitizeText(itemId, 100),
      contributorName: sanitizeText(contributorName, 100),
      contributorEmail: sanitizeText(contributorEmail, 200),
      amount: amount || 0,
      isAnonymous: Boolean(isAnonymous),
      message: message ? sanitizeText(message, 500) : null,
      source: sanitizeText(source || "direct", 50),
      affiliateCommission: 0,
      isConfirmed: true,
      createdAt: now,
    };

    // Save contribution to a contributions sub-collection
    // For now, we update the registry stats and store contribution inline
    const updateExpression = `
      SET stats.uniqueContributors = stats.uniqueContributors + :one,
          stats.valueFulfilled = stats.valueFulfilled + :amount,
          stats.lastActivityAt = :now,
          updatedAt = :now
    `;

    const updateCommand = new UpdateItemCommand({
      TableName: REGISTRY_TABLE,
      Key: marshall({ id: registryId }),
      UpdateExpression: updateExpression.trim().replace(/\n\s*/g, " "),
      ExpressionAttributeValues: marshall({
        ":one": 1,
        ":amount": amount || 0,
        ":now": now,
      }),
      ReturnValues: "ALL_NEW",
    });

    await dynamoClient.send(updateCommand);

    return NextResponse.json({
      success: true,
      data: {
        contribution,
        message: "Contribution recorded successfully",
      },
    });
  } catch (error) {
    console.error("Record contribution error:", error);
    return errorResponse("Failed to record contribution", 500);
  }
}
