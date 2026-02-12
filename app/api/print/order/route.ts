import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { DynamoDBClient, PutItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";
import Stripe from "stripe";
import {
  getSKUForSize,
  getPricePerUnit,
  estimateShipping,
} from "@/lib/services/prodigi-service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia" as Stripe.LatestApiVersion,
});

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const PRINT_ORDERS_TABLE = process.env.DYNAMODB_PRINT_ORDERS_TABLE || "InviteGenerator-PrintOrders-production";
const INVITATIONS_TABLE = process.env.DYNAMODB_INVITATIONS_TABLE || "InviteGenerator-Invitations-production";

interface PrintOrderRequest {
  invitationId: string;
  size: string;
  quantity: number;
  cardType: "flat" | "folded" | "postcard" | "premium";
  finish: string;
  shippingMethod: string;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
  };
}

// POST /api/print/order - Create a print order
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body: PrintOrderRequest = await request.json();
    const {
      invitationId,
      size,
      quantity,
      cardType,
      finish,
      shippingMethod,
      shippingAddress,
    } = body;

    // Validate request
    if (!invitationId || !size || !quantity || !shippingAddress) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "Missing required fields" } },
        { status: 400 }
      );
    }

    // Verify invitation exists and belongs to user
    const invitationResult = await dynamodb.send(
      new GetItemCommand({
        TableName: INVITATIONS_TABLE,
        Key: marshall({ id: invitationId }),
      })
    );

    if (!invitationResult.Item) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Invitation not found" } },
        { status: 404 }
      );
    }

    const invitation = unmarshall(invitationResult.Item);

    if (invitation.userId !== auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    // Calculate pricing
    const productKey = `${cardType}-${size}` as "flat-4x6" | "flat-5x7" | "folded-5x7" | "premium-5x7";
    const unitPrice = getPricePerUnit(productKey, quantity);
    const subtotal = unitPrice * quantity;
    const shipping = estimateShipping(shippingAddress.country, shippingMethod as "standard" | "express");
    const total = subtotal + shipping;

    // Create order ID
    const orderId = uuidv4();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${cardType.charAt(0).toUpperCase() + cardType.slice(1)} Cards - ${size}`,
              description: `${quantity}x ${finish} finish invitations`,
              images: invitation.previewUrl ? [invitation.previewUrl] : undefined,
            },
            unit_amount: Math.round(unitPrice * 100), // Stripe uses cents
          },
          quantity,
        },
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Shipping (${shippingMethod})`,
              description: `Delivery to ${shippingAddress.country}`,
            },
            unit_amount: Math.round(shipping * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${orderId}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invitations/${invitationId}/share?tab=print&cancelled=true`,
      metadata: {
        orderId,
        invitationId,
        userId: auth.userId,
        type: "print_order",
      },
    });

    // Save order to DynamoDB (pending payment)
    const order = {
      id: orderId,
      userId: auth.userId,
      invitationId,
      status: "pending_payment",
      stripeSessionId: session.id,
      product: {
        sku: getSKUForSize(size, cardType),
        size,
        cardType,
        finish,
        quantity,
        unitPrice,
      },
      shipping: {
        method: shippingMethod,
        address: shippingAddress,
        cost: shipping,
      },
      pricing: {
        subtotal,
        shipping,
        tax: 0,
        total,
        currency: "USD",
      },
      prodigiOrderId: null,
      trackingNumber: null,
      trackingUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dynamodb.send(
      new PutItemCommand({
        TableName: PRINT_ORDERS_TABLE,
        Item: marshall(order),
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        checkoutUrl: session.url,
        sessionId: session.id,
      },
    });
  } catch (error) {
    console.error("Print order error:", error);
    return NextResponse.json(
      { success: false, error: { code: "ORDER_FAILED", message: "Failed to create order" } },
      { status: 500 }
    );
  }
}

// GET /api/print/order - Get user's print orders
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    // This would typically use a GSI on userId
    // For now, return a message about the endpoint
    return NextResponse.json({
      success: true,
      data: {
        message: "Use /api/print/order/[id] to get a specific order",
        note: "List orders feature coming soon",
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { success: false, error: { code: "FETCH_FAILED", message: "Failed to fetch orders" } },
      { status: 500 }
    );
  }
}

// handlePaymentSuccess moved to @/lib/services/print-order-service
