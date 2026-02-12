import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { prodigiService } from "@/lib/services/prodigi-service";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const PRINT_ORDERS_TABLE = process.env.DYNAMODB_PRINT_ORDERS_TABLE || "InviteGenerator-PrintOrders-production";

// GET /api/print/order/[id] - Get a specific print order
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

    // Get order
    const orderResult = await dynamodb.send(
      new GetItemCommand({
        TableName: PRINT_ORDERS_TABLE,
        Key: marshall({ id }),
      })
    );

    if (!orderResult.Item) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    const order = unmarshall(orderResult.Item);

    // Verify ownership
    if (order.userId !== auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    // If order has a Prodigi order ID, fetch latest status from Prodigi
    if (order.prodigiOrderId && process.env.PRODIGI_API_KEY) {
      try {
        const prodigiOrder = await prodigiService.getOrder(order.prodigiOrderId);

        // Update local order with Prodigi status
        if (prodigiOrder.order) {
          const prodigiStatus = prodigiOrder.order.status;
          const shipments = prodigiOrder.order.shipments || [];

          let newStatus = order.status;
          let trackingNumber = order.trackingNumber;
          let trackingUrl = order.trackingUrl;

          // Map Prodigi status to our status
          if (prodigiStatus.stage === "Complete") {
            newStatus = "delivered";
          } else if (prodigiStatus.stage === "InProduction") {
            newStatus = "printing";
          } else if (prodigiStatus.stage === "Shipping" || shipments.length > 0) {
            newStatus = "shipped";
            if (shipments[0]?.tracking) {
              trackingNumber = shipments[0].tracking.number;
              trackingUrl = shipments[0].tracking.url;
            }
          }

          // Update if status changed
          if (
            newStatus !== order.status ||
            trackingNumber !== order.trackingNumber
          ) {
            await dynamodb.send(
              new UpdateItemCommand({
                TableName: PRINT_ORDERS_TABLE,
                Key: marshall({ id }),
                UpdateExpression:
                  "SET #status = :status, trackingNumber = :tracking, trackingUrl = :trackingUrl, updatedAt = :updatedAt",
                ExpressionAttributeNames: {
                  "#status": "status",
                },
                ExpressionAttributeValues: marshall({
                  ":status": newStatus,
                  ":tracking": trackingNumber,
                  ":trackingUrl": trackingUrl,
                  ":updatedAt": new Date().toISOString(),
                }),
              })
            );

            order.status = newStatus;
            order.trackingNumber = trackingNumber;
            order.trackingUrl = trackingUrl;
          }
        }
      } catch (prodigiError) {
        console.warn("Could not fetch Prodigi status:", prodigiError);
        // Continue with local data
      }
    }

    return NextResponse.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { success: false, error: { code: "FETCH_FAILED", message: "Failed to fetch order" } },
      { status: 500 }
    );
  }
}

// POST /api/print/order/[id] - Cancel an order (if not yet in production)
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
    const body = await request.json();
    const { action } = body;

    if (action !== "cancel") {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_ACTION", message: "Invalid action" } },
        { status: 400 }
      );
    }

    // Get order
    const orderResult = await dynamodb.send(
      new GetItemCommand({
        TableName: PRINT_ORDERS_TABLE,
        Key: marshall({ id }),
      })
    );

    if (!orderResult.Item) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    const order = unmarshall(orderResult.Item);

    // Verify ownership
    if (order.userId !== auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    // Check if order can be cancelled
    const cancellableStatuses = ["pending_payment", "processing", "confirmed"];
    if (!cancellableStatuses.includes(order.status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CANNOT_CANCEL",
            message: `Order cannot be cancelled (status: ${order.status})`,
          },
        },
        { status: 400 }
      );
    }

    // Cancel Prodigi order if exists
    if (order.prodigiOrderId && process.env.PRODIGI_API_KEY) {
      try {
        await prodigiService.cancelOrder(order.prodigiOrderId);
      } catch (prodigiError) {
        console.warn("Could not cancel Prodigi order:", prodigiError);
        // Continue with local cancellation
      }
    }

    // Update order status
    await dynamodb.send(
      new UpdateItemCommand({
        TableName: PRINT_ORDERS_TABLE,
        Key: marshall({ id }),
        UpdateExpression: "SET #status = :status, cancelledAt = :cancelledAt, updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: marshall({
          ":status": "cancelled",
          ":cancelledAt": new Date().toISOString(),
          ":updatedAt": new Date().toISOString(),
        }),
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        message: "Order cancelled successfully",
        orderId: id,
      },
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json(
      { success: false, error: { code: "CANCEL_FAILED", message: "Failed to cancel order" } },
      { status: 500 }
    );
  }
}
