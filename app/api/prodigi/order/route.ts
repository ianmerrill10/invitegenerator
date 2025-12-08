import { NextRequest, NextResponse } from "next/server";
import {
  ProdigiClient,
  type ProdigiRecipient,
  type ProdigiCreateOrderRequest,
} from "@/lib/prodigi/client";
import { PRODIGI_PRODUCTS, type ProductId } from "@/lib/prodigi/config";

// POST /api/prodigi/order - Create a print order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      recipient,
      shippingMethod = "Standard",
      merchantReference,
    } = body as {
      items: Array<{
        productId: ProductId;
        quantity: number;
        imageUrl: string;
        customerPrice?: number;
      }>;
      recipient: {
        name: string;
        email?: string;
        phone?: string;
        address: {
          line1: string;
          line2?: string;
          city: string;
          state?: string;
          postalCode: string;
          country: string;
        };
      };
      shippingMethod?: "Budget" | "Standard" | "Express" | "Overnight";
      merchantReference?: string;
    };

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items array is required" },
        { status: 400 }
      );
    }

    if (!recipient || !recipient.name || !recipient.address) {
      return NextResponse.json(
        { error: "Recipient with name and address is required" },
        { status: 400 }
      );
    }

    // Validate all items have image URLs
    for (const item of items) {
      if (!item.imageUrl) {
        return NextResponse.json(
          { error: `Image URL is required for product: ${item.productId}` },
          { status: 400 }
        );
      }
      if (!PRODIGI_PRODUCTS[item.productId]) {
        return NextResponse.json(
          { error: `Unknown product: ${item.productId}` },
          { status: 400 }
        );
      }
    }

    // Build Prodigi recipient
    const prodigiRecipient: ProdigiRecipient = {
      name: recipient.name,
      email: recipient.email,
      phoneNumber: recipient.phone,
      address: {
        line1: recipient.address.line1,
        line2: recipient.address.line2,
        townOrCity: recipient.address.city,
        stateOrCounty: recipient.address.state,
        postalOrZipCode: recipient.address.postalCode,
        countryCode: recipient.address.country,
      },
    };

    // Build order items
    const orderItems = items.map((item, index) => {
      const product = PRODIGI_PRODUCTS[item.productId];
      return {
        merchantReference: `item-${index + 1}-${item.productId}`,
        sku: product.sku,
        copies: item.quantity,
        sizing: "fillPrintArea" as const,
        assets: [
          {
            printArea: "default",
            url: item.imageUrl,
          },
        ],
        ...(item.customerPrice && {
          recipientCost: {
            amount: item.customerPrice.toFixed(2),
            currency: "USD",
          },
        }),
      };
    });

    // Generate merchant reference if not provided
    const reference =
      merchantReference || `IG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Create client
    const useSandbox = process.env.PRODIGI_ENVIRONMENT !== "live";
    const client = new ProdigiClient(undefined, useSandbox);

    // Create order request
    const orderRequest: ProdigiCreateOrderRequest = {
      merchantReference: reference,
      shippingMethod,
      recipient: prodigiRecipient,
      items: orderItems,
      idempotencyKey: `${reference}-${Date.now()}`,
      metadata: {
        source: "InviteGenerator",
        createdAt: new Date().toISOString(),
      },
    };

    // Submit order
    const response = await client.createOrder(orderRequest);

    return NextResponse.json({
      success: true,
      data: {
        orderId: response.order.id,
        merchantReference: reference,
        status: response.order.status.stage,
        outcome: response.outcome,
        created: response.order.created,
        items: response.order.items.map((item) => ({
          id: item.id,
          sku: item.sku,
          copies: item.copies,
          status: item.status,
        })),
      },
    });
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 }
    );
  }
}
