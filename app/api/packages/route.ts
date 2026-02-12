import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { verifyAuth } from "@/lib/auth-server";

// Initialize DynamoDB
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

const PACKAGES_TABLE = process.env.DYNAMODB_PACKAGES_TABLE || "InviteGenerator-Packages-production";

// Helper to create error response
function errorResponse(message: string, code: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status }
  );
}

// GET /api/packages - List available packages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const tier = searchParams.get("tier");
    const slug = searchParams.get("slug");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    // If slug is provided, query for a specific package
    if (slug) {
      const queryCommand = new ScanCommand({
        TableName: PACKAGES_TABLE,
        FilterExpression: "slug = :slug AND isActive = :active",
        ExpressionAttributeValues: {
          ":slug": slug,
          ":active": true,
        },
        Limit: 1,
      });

      const result = await docClient.send(queryCommand);

      return NextResponse.json({
        success: true,
        data: {
          packages: result.Items || [],
          total: result.Count || 0,
          page: 1,
          pageSize: 1,
          hasMore: false,
        },
      });
    }

    // Build filter expression for listing
    const filterParts: string[] = ["isActive = :active"];
    const expressionValues: Record<string, string | number | boolean> = {
      ":active": true,
    };

    if (category) {
      filterParts.push("category = :category");
      expressionValues[":category"] = category;
    }

    if (tier) {
      filterParts.push("tier = :tier");
      expressionValues[":tier"] = tier;
    }

    const scanCommand = new ScanCommand({
      TableName: PACKAGES_TABLE,
      FilterExpression: filterParts.join(" AND "),
      ExpressionAttributeValues: expressionValues,
    });

    const result = await docClient.send(scanCommand);
    const allItems = result.Items || [];

    // Sort by popularity descending
    allItems.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    // Paginate
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = allItems.slice(startIndex, startIndex + pageSize);

    return NextResponse.json({
      success: true,
      data: {
        packages: paginatedItems,
        total: allItems.length,
        page,
        pageSize,
        hasMore: startIndex + pageSize < allItems.length,
      },
    });
  } catch (error) {
    console.error("Get packages error:", error);
    return errorResponse("Failed to fetch packages", "PACKAGES_FETCH_ERROR", 500);
  }
}

// POST /api/packages - Create a package order
export async function POST(request: NextRequest) {
  try {
    const auth = (await verifyAuth(request)) as {
      authenticated: boolean;
      userId: string | null;
    };
    if (!auth.authenticated || !auth.userId) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }
    const userId = auth.userId;

    const body = await request.json();
    const {
      packageId,
      selectedItemIds,
      invitationQuantity,
      paperType,
      shippingAddress,
      priceBreakdown,
    } = body;

    // Validate required fields
    if (!packageId) {
      return errorResponse("Package ID is required", "MISSING_PACKAGE_ID");
    }
    if (!selectedItemIds || !Array.isArray(selectedItemIds)) {
      return errorResponse("Selected item IDs are required", "MISSING_ITEMS");
    }
    if (!invitationQuantity || invitationQuantity < 1) {
      return errorResponse("Valid invitation quantity is required", "INVALID_QUANTITY");
    }
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1) {
      return errorResponse("Shipping address is required", "MISSING_ADDRESS");
    }

    // Generate order
    const orderId = uuidv4();
    const orderNumber = `PKG-${Date.now().toString(36).toUpperCase()}-${orderId.slice(0, 4).toUpperCase()}`;
    const now = new Date().toISOString();

    const order = {
      id: orderId,
      orderNumber,
      userId,
      packageId,
      selectedItemIds,
      invitationQuantity,
      paperType: paperType || "standard",
      status: "pending",
      priceBreakdown: priceBreakdown || null,
      shippingAddress,
      billingAddress: body.billingAddress || shippingAddress,
      shippingMethod: body.shippingMethod || "standard",
      paymentIntentId: body.paymentIntentId || null,
      amazonCartUrl: null,
      printOrderId: null,
      trackingNumbers: [],
      notes: body.notes || "",
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };

    // Save to DynamoDB
    const putCommand = new PutCommand({
      TableName: PACKAGES_TABLE,
      Item: order,
    });

    await docClient.send(putCommand);

    console.info("Package order created:", {
      orderId,
      orderNumber,
      userId,
      packageId,
    });

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Create package order error:", error);
    return errorResponse("Failed to create package order", "ORDER_CREATE_ERROR", 500);
  }
}
