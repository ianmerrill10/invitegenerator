/**
 * Product Recommendations API
 *
 * Returns personalized product recommendations based on:
 * - Event type (birthday, wedding, etc.)
 * - Guest count (for quantity suggestions)
 * - User location (for local vendors)
 * - Event date (seasonal items)
 *
 * DATA USAGE:
 * Uses invitation data to provide targeted recommendations.
 * Tracks clicks for affiliate attribution.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getProductRecommendations,
  getStoreForEventType,
  getRecommendedQuantity,
  getAffiliateLink,
  AFFILIATE_PARTNERS,
} from "@/lib/affiliate-config";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { cookies } from "next/headers";

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

interface RecommendationRequest {
  eventType: string;
  guestCount?: number;
  eventDate?: string;
  location?: string;
  categories?: string[];
}

/**
 * POST: Get product recommendations
 */
export async function POST(request: NextRequest) {
  try {
    const body: RecommendationRequest = await request.json();
    const { eventType, guestCount = 20, eventDate, location, categories } = body;

    if (!eventType) {
      return NextResponse.json(
        { error: "Event type is required" },
        { status: 400 }
      );
    }

    // Get user ID for tracking
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    // Get base recommendations for event type
    const productCategories = getProductRecommendations(eventType);
    const store = getStoreForEventType(eventType);

    // Build product recommendations with quantities and affiliate links
    const recommendations = productCategories
      .filter((cat) => !categories || categories.includes(cat.category.toLowerCase()))
      .map((category) => ({
        category: category.category,
        products: category.products.map((product) => ({
          name: formatProductName(product),
          slug: product,
          recommendedQuantity: getRecommendedQuantity(product, guestCount),
          affiliateLinks: AFFILIATE_PARTNERS.slice(0, 3).map((partner) => ({
            partner: partner.name,
            partnerId: partner.id,
            url: getAffiliateLink(
              partner.id,
              `${partner.baseUrl}/search?q=${encodeURIComponent(`${eventType} ${product}`)}`,
              eventType
            ),
          })),
          shopifyLink: store
            ? `https://${store.domain}/collections/${category.category.toLowerCase()}/${product}`
            : null,
        })),
      }));

    // Track recommendation request for analytics
    if (userId) {
      await trackRecommendationView(userId, eventType, guestCount, categories);
    }

    // Get featured/seasonal products
    const featured = getFeaturedProducts(eventType, eventDate);

    return NextResponse.json({
      success: true,
      data: {
        eventType,
        guestCount,
        store: store
          ? {
              name: store.storeName,
              url: `https://${store.domain}`,
            }
          : null,
        recommendations,
        featured,
        meta: {
          totalCategories: recommendations.length,
          totalProducts: recommendations.reduce((sum, cat) => sum + cat.products.length, 0),
        },
      },
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}

/**
 * Track product link click for affiliate attribution
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { productSlug, partnerId, eventType, invitationId } = body;

    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    const clickRecord = {
      id: `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userId || "anonymous",
      productSlug,
      partnerId,
      eventType,
      invitationId,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent"),
      referrer: request.headers.get("referer"),
    };

    await docClient.send(
      new PutCommand({
        TableName: process.env.DYNAMODB_CLICKS_TABLE || "invitegen-affiliate-clicks",
        Item: clickRecord,
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Click tracking error:", error);
    return NextResponse.json({ success: true }); // Don't fail on tracking errors
  }
}

function formatProductName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getFeaturedProducts(eventType: string, eventDate?: string): any[] {
  // Seasonal/featured products based on time of year
  const month = eventDate
    ? new Date(eventDate).getMonth()
    : new Date().getMonth();

  const seasonalProducts = [];

  // Holiday-specific recommendations
  if (month === 11) {
    // December
    seasonalProducts.push({
      name: "Holiday-Themed Party Supplies",
      description: "Festive decorations for your celebration",
      discount: "20% OFF",
    });
  } else if (month === 9) {
    // October
    seasonalProducts.push({
      name: "Fall Harvest Decorations",
      description: "Autumn-inspired party themes",
      discount: "15% OFF",
    });
  }

  // Event-specific featured products
  const eventFeatured: Record<string, any[]> = {
    wedding: [
      {
        name: "Premium Centerpiece Collection",
        description: "Elegant table decorations for your reception",
        discount: "Bundle Deal",
      },
    ],
    birthday: [
      {
        name: "Complete Party Kit",
        description: "Everything you need in one box",
        discount: "Save 25%",
      },
    ],
    baby_shower: [
      {
        name: "Gender Reveal Supplies",
        description: "Make the big reveal special",
        discount: "New Arrivals",
      },
    ],
  };

  return [...seasonalProducts, ...(eventFeatured[eventType] || [])];
}

async function trackRecommendationView(
  userId: string,
  eventType: string,
  guestCount: number,
  categories?: string[]
) {
  try {
    await docClient.send(
      new PutCommand({
        TableName: process.env.DYNAMODB_ANALYTICS_TABLE || "invitegen-analytics",
        Item: {
          id: `rec_${Date.now()}`,
          type: "recommendation_view",
          userId,
          eventType,
          guestCount,
          categories,
          timestamp: new Date().toISOString(),
        },
      })
    );
  } catch {
    // Silent fail - don't block recommendations
  }
}
