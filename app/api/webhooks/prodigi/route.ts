import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient, UpdateItemCommand, QueryCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import crypto from "crypto";
import { sendShippingNotificationEmail } from "@/lib/email";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const PRINT_ORDERS_TABLE = process.env.DYNAMODB_PRINT_ORDERS_TABLE || "InviteGenerator-PrintOrders-production";
const PRODIGI_WEBHOOK_SECRET = process.env.PRODIGI_WEBHOOK_SECRET;

interface ProdigiWebhookEvent {
  event: string;
  data: {
    order: {
      id: string;
      status: {
        stage: string;
        issues?: Array<{
          code: string;
          message: string;
        }>;
      };
      shipments?: Array<{
        id: string;
        carrier: string;
        tracking?: {
          number: string;
          url: string;
        };
        dispatchDate?: string;
        items: Array<{
          itemId: string;
          sku: string;
        }>;
      }>;
    };
  };
  timestamp: string;
}

// Verify Prodigi webhook signature
function verifySignature(payload: string, signature: string): boolean {
  if (!PRODIGI_WEBHOOK_SECRET) {
    console.warn("No webhook secret configured, skipping verification");
    return true; // Allow in development
  }

  const expectedSignature = crypto
    .createHmac("sha256", PRODIGI_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Find order by Prodigi order ID
async function findOrderByProdigiId(prodigiOrderId: string) {
  const result = await dynamodb.send(
    new QueryCommand({
      TableName: PRINT_ORDERS_TABLE,
      IndexName: "prodigiOrderId-index",
      KeyConditionExpression: "prodigiOrderId = :prodigiOrderId",
      ExpressionAttributeValues: marshall({ ":prodigiOrderId": prodigiOrderId }),
    })
  );

  if (result.Items && result.Items.length > 0) {
    return unmarshall(result.Items[0]);
  }

  return null;
}

// Update order status
async function updateOrderStatus(
  orderId: string,
  updates: {
    status?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    carrier?: string;
    shippedAt?: string;
    prodigiStatus?: Record<string, unknown>;
  }
) {
  const updateExpressions: string[] = ["updatedAt = :updatedAt"];
  const expressionAttributeValues: Record<string, unknown> = {
    ":updatedAt": new Date().toISOString(),
  };
  const expressionAttributeNames: Record<string, string> = {};

  if (updates.status) {
    updateExpressions.push("#status = :status");
    expressionAttributeValues[":status"] = updates.status;
    expressionAttributeNames["#status"] = "status";
  }

  if (updates.trackingNumber) {
    updateExpressions.push("trackingNumber = :trackingNumber");
    expressionAttributeValues[":trackingNumber"] = updates.trackingNumber;
  }

  if (updates.trackingUrl) {
    updateExpressions.push("trackingUrl = :trackingUrl");
    expressionAttributeValues[":trackingUrl"] = updates.trackingUrl;
  }

  if (updates.carrier) {
    updateExpressions.push("carrier = :carrier");
    expressionAttributeValues[":carrier"] = updates.carrier;
  }

  if (updates.shippedAt) {
    updateExpressions.push("shippedAt = :shippedAt");
    expressionAttributeValues[":shippedAt"] = updates.shippedAt;
  }

  if (updates.prodigiStatus) {
    updateExpressions.push("prodigiStatus = :prodigiStatus");
    expressionAttributeValues[":prodigiStatus"] = updates.prodigiStatus;
  }

  await dynamodb.send(
    new UpdateItemCommand({
      TableName: PRINT_ORDERS_TABLE,
      Key: marshall({ id: orderId }),
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ...(Object.keys(expressionAttributeNames).length > 0 && {
        ExpressionAttributeNames: expressionAttributeNames,
      }),
    })
  );
}

// POST /api/webhooks/prodigi - Handle Prodigi webhook events
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-prodigi-signature") || "";

    // Verify signature
    if (PRODIGI_WEBHOOK_SECRET && !verifySignature(payload, signature)) {
      console.error("Invalid Prodigi webhook signature");
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    const event: ProdigiWebhookEvent = JSON.parse(payload);
    console.info(`Prodigi webhook received: ${event.event}`, {
      orderId: event.data.order.id,
      stage: event.data.order.status.stage,
    });

    // Find order in our database
    const order = await findOrderByProdigiId(event.data.order.id);

    if (!order) {
      console.warn(`Order not found for Prodigi order ID: ${event.data.order.id}`);
      return NextResponse.json({ success: true, message: "Order not found, skipping" });
    }

    // Process event based on type
    const prodigiOrder = event.data.order;
    const updates: Parameters<typeof updateOrderStatus>[1] = {
      prodigiStatus: prodigiOrder.status as Record<string, unknown>,
    };

    switch (event.event) {
      case "order.created":
        updates.status = "processing";
        break;

      case "order.submission_failed":
        updates.status = "failed";
        console.error("Prodigi order submission failed:", prodigiOrder.status.issues);
        break;

      case "order.accepted":
        updates.status = "accepted";
        break;

      case "order.in_progress":
        updates.status = "printing";
        break;

      case "order.shipped":
      case "shipment.dispatched":
        updates.status = "shipped";

        // Extract tracking info from first shipment
        if (prodigiOrder.shipments && prodigiOrder.shipments.length > 0) {
          const shipment = prodigiOrder.shipments[0];
          updates.carrier = shipment.carrier;
          updates.shippedAt = shipment.dispatchDate || new Date().toISOString();

          if (shipment.tracking) {
            updates.trackingNumber = shipment.tracking.number;
            updates.trackingUrl = shipment.tracking.url;
          }
        }
        break;

      case "order.complete":
        updates.status = "delivered";
        break;

      case "order.cancelled":
        updates.status = "cancelled";
        break;

      case "order.problem":
        updates.status = "problem";
        console.error("Prodigi order has a problem:", prodigiOrder.status.issues);
        break;

      default:
        console.warn(`Unhandled Prodigi event type: ${event.event}`);
    }

    // Update order in database
    await updateOrderStatus(order.id, updates);

    console.info(`Updated order ${order.id} with status: ${updates.status || "unchanged"}`);

    // Send shipping notification email to customer
    if (updates.status === "shipped" && order.userId) {
      try {
        const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || "InviteGenerator-Users-production";
        const userResult = await dynamodb.send(
          new GetItemCommand({
            TableName: USERS_TABLE,
            Key: marshall({ id: order.userId }),
          })
        );
        if (userResult.Item) {
          const user = unmarshall(userResult.Item);
          if (user.email) {
            await sendShippingNotificationEmail(
              user.email,
              order.id,
              updates.trackingNumber,
              updates.trackingUrl,
              updates.carrier
            );
          }
        }
      } catch (emailErr) {
        console.error("Failed to send shipping notification email:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${event.event} event`,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Prodigi webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// GET /api/webhooks/prodigi - Health check
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Prodigi webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
