import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { DynamoDBClient, GetItemCommand, UpdateItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const TEMPLATES_TABLE = process.env.DYNAMODB_TEMPLATES_TABLE || "InviteGenerator-Templates-production";
const RATINGS_TABLE = process.env.DYNAMODB_TEMPLATE_RATINGS_TABLE || "InviteGenerator-TemplateRatings-production";

interface RateRequest {
  rating: number; // 1-5
  review?: string;
}

// POST /api/templates/[id]/rate - Rate a template
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body: RateRequest = await request.json();
    const { rating, review } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_RATING", message: "Rating must be an integer between 1 and 5" } },
        { status: 400 }
      );
    }

    // Verify template exists
    const templateResult = await dynamodb.send(
      new GetItemCommand({
        TableName: TEMPLATES_TABLE,
        Key: marshall({ id }),
      })
    );

    if (!templateResult.Item) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Template not found" } },
        { status: 404 }
      );
    }

    const template = unmarshall(templateResult.Item);
    const now = new Date().toISOString();

    // Check if user already rated this template
    const ratingKey = `${auth.userId}#${id}`;
    let existingRating: number | null = null;

    try {
      const existingResult = await dynamodb.send(
        new GetItemCommand({
          TableName: RATINGS_TABLE,
          Key: marshall({ id: ratingKey }),
        })
      );

      if (existingResult.Item) {
        const existing = unmarshall(existingResult.Item);
        existingRating = existing.rating;
      }
    } catch {
      // Rating table might not exist, continue
    }

    // Save the rating
    try {
      await dynamodb.send(
        new PutItemCommand({
          TableName: RATINGS_TABLE,
          Item: marshall({
            id: ratingKey,
            templateId: id,
            userId: auth.userId,
            rating,
            review: review || null,
            createdAt: now,
            updatedAt: now,
          }, { removeUndefinedValues: true }),
        })
      );
    } catch (error) {
      console.warn("Could not save to ratings table:", error);
      // Continue to update template aggregate
    }

    // Update template aggregate rating
    const currentRating = parseFloat(template.rating) || 0;
    const currentCount = template.ratingCount || 0;

    let newRating: number;
    let newCount: number;

    if (existingRating !== null) {
      // Update existing rating - recalculate
      const totalRatingPoints = currentRating * currentCount - existingRating + rating;
      newCount = currentCount;
      newRating = totalRatingPoints / newCount;
    } else {
      // New rating
      const totalRatingPoints = currentRating * currentCount + rating;
      newCount = currentCount + 1;
      newRating = totalRatingPoints / newCount;
    }

    // Update template
    await dynamodb.send(
      new UpdateItemCommand({
        TableName: TEMPLATES_TABLE,
        Key: marshall({ id }),
        UpdateExpression: "SET rating = :rating, ratingCount = :count, updatedAt = :updatedAt",
        ExpressionAttributeValues: marshall({
          ":rating": newRating.toFixed(1),
          ":count": newCount,
          ":updatedAt": now,
        }),
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        templateId: id,
        userRating: rating,
        averageRating: newRating.toFixed(1),
        totalRatings: newCount,
        isUpdate: existingRating !== null,
      },
    });
  } catch (error) {
    console.error("Rate template error:", error);
    return NextResponse.json(
      { success: false, error: { code: "RATE_FAILED", message: "Failed to rate template" } },
      { status: 500 }
    );
  }
}

// GET /api/templates/[id]/rate - Get user's rating for a template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const ratingKey = `${auth.userId}#${id}`;

    try {
      const result = await dynamodb.send(
        new GetItemCommand({
          TableName: RATINGS_TABLE,
          Key: marshall({ id: ratingKey }),
        })
      );

      if (result.Item) {
        const rating = unmarshall(result.Item);
        return NextResponse.json({
          success: true,
          data: {
            rating: rating.rating,
            review: rating.review,
            createdAt: rating.createdAt,
          },
        });
      }
    } catch {
      // Table might not exist
    }

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error("Get rating error:", error);
    return NextResponse.json(
      { success: false, error: { code: "FETCH_FAILED", message: "Failed to fetch rating" } },
      { status: 500 }
    );
  }
}
