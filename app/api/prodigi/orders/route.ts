import { NextRequest, NextResponse } from "next/server";
import { ProdigiClient } from "@/lib/prodigi/client";

// GET /api/prodigi/orders - List orders or get specific order
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const top = searchParams.get("top");
    const skip = searchParams.get("skip");
    const status = searchParams.get("status");

    // Create client
    const useSandbox = process.env.PRODIGI_ENVIRONMENT !== "live";
    const client = new ProdigiClient(undefined, useSandbox);

    // Get specific order if ID provided
    if (orderId) {
      const response = await client.getOrder(orderId);
      return NextResponse.json({
        success: true,
        data: {
          order: {
            id: response.order.id,
            created: response.order.created,
            lastUpdated: response.order.lastUpdated,
            merchantReference: response.order.merchantReference,
            shippingMethod: response.order.shippingMethod,
            status: response.order.status,
            recipient: {
              name: response.order.recipient.name,
              address: response.order.recipient.address,
            },
            items: response.order.items.map((item) => ({
              id: item.id,
              sku: item.sku,
              copies: item.copies,
              status: item.status,
            })),
            shipments: response.order.shipments.map((shipment) => ({
              id: shipment.id,
              status: shipment.status,
              carrier: shipment.carrier,
              tracking: shipment.tracking,
              dispatchDate: shipment.dispatchDate,
            })),
            charges: response.order.charges,
          },
        },
      });
    }

    // List orders
    const response = await client.getOrders({
      top: top ? parseInt(top) : 10,
      skip: skip ? parseInt(skip) : 0,
      status: status || undefined,
    });

    return NextResponse.json({
      success: true,
      data: {
        orders: response.orders.map((order) => ({
          id: order.id,
          created: order.created,
          merchantReference: order.merchantReference,
          status: order.status.stage,
          shippingMethod: order.shippingMethod,
          itemCount: order.items.length,
          recipient: order.recipient.name,
        })),
        hasMore: response.hasMore,
        nextUrl: response.nextUrl,
      },
    });
  } catch (error) {
    console.error("Orders error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}

// POST /api/prodigi/orders/cancel - Cancel an order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, action } = body as {
      orderId: string;
      action: "cancel";
    };

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    if (action !== "cancel") {
      return NextResponse.json(
        { error: "Only 'cancel' action is supported" },
        { status: 400 }
      );
    }

    // Create client
    const useSandbox = process.env.PRODIGI_ENVIRONMENT !== "live";
    const client = new ProdigiClient(undefined, useSandbox);

    const response = await client.cancelOrder(orderId);

    return NextResponse.json({
      success: true,
      data: {
        orderId: response.order.id,
        status: response.order.status.stage,
        outcome: response.outcome,
      },
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to cancel order",
      },
      { status: 500 }
    );
  }
}
