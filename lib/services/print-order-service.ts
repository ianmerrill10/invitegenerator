/**
 * Print Order Service
 *
 * Handles payment success + Prodigi order creation.
 * Extracted from the route file so it can be imported by webhooks
 * without violating Next.js route export constraints.
 */

import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import {
  prodigiService,
  PRODIGI_SHIPPING,
  PRODIGI_FINISHES,
  type ProdigiAddress,
} from "@/lib/services/prodigi-service";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const PRINT_ORDERS_TABLE = process.env.DYNAMODB_PRINT_ORDERS_TABLE || "InviteGenerator-PrintOrders-production";
const INVITATIONS_TABLE = process.env.DYNAMODB_INVITATIONS_TABLE || "InviteGenerator-Invitations-production";

/**
 * Handle successful payment for a print order.
 * Creates a Prodigi fulfillment order and updates the DynamoDB record.
 */
export async function handlePaymentSuccess(
  orderId: string,
  invitationId: string,
  userId: string
): Promise<void> {
  // Get the order
  const orderResult = await dynamodb.send(
    new GetItemCommand({
      TableName: PRINT_ORDERS_TABLE,
      Key: marshall({ id: orderId }),
    })
  );

  if (!orderResult.Item) {
    throw new Error(`Order not found: ${orderId}`);
  }

  const order = unmarshall(orderResult.Item);

  // Get the invitation to get the print-ready image URL
  const invitationResult = await dynamodb.send(
    new GetItemCommand({
      TableName: INVITATIONS_TABLE,
      Key: marshall({ id: invitationId }),
    })
  );

  if (!invitationResult.Item) {
    throw new Error(`Invitation not found: ${invitationId}`);
  }

  const invitation = unmarshall(invitationResult.Item);

  // Create Prodigi order if API key is configured
  if (process.env.PRODIGI_API_KEY) {
    const prodigiAddress: ProdigiAddress = {
      name: order.shipping.address.name,
      line1: order.shipping.address.line1,
      line2: order.shipping.address.line2,
      city: order.shipping.address.city,
      state: order.shipping.address.state,
      postalCode: order.shipping.address.postalCode,
      countryCode: order.shipping.address.country,
      phone: order.shipping.address.phone,
      email: order.shipping.address.email,
    };

    const prodigiOrder = await prodigiService.createOrder({
      merchantReference: orderId,
      shippingMethod: PRODIGI_SHIPPING[order.shipping.method.toUpperCase() as keyof typeof PRODIGI_SHIPPING] || PRODIGI_SHIPPING.STANDARD,
      recipient: prodigiAddress,
      items: [
        {
          sku: order.product.sku,
          copies: order.product.quantity,
          sizing: "fillPrintArea",
          assets: [
            {
              printArea: invitation.printReadyUrl || invitation.previewUrl,
            },
          ],
          attributes: {
            finish: PRODIGI_FINISHES[order.product.finish.toUpperCase() as keyof typeof PRODIGI_FINISHES] || PRODIGI_FINISHES.MATTE,
          },
        },
      ],
      metadata: {
        userId,
        invitationId,
        source: "invitegenerator",
      },
    });

    // Update order with Prodigi order ID and status
    await dynamodb.send(
      new UpdateItemCommand({
        TableName: PRINT_ORDERS_TABLE,
        Key: marshall({ id: orderId }),
        UpdateExpression: "SET #status = :status, prodigiOrderId = :prodigiOrderId, updatedAt = :updatedAt",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: marshall({
          ":status": "processing",
          ":prodigiOrderId": prodigiOrder.order.id,
          ":updatedAt": new Date().toISOString(),
        }),
      })
    );
    return;
  }

  // No Prodigi API key — mark for manual fulfillment
  await dynamodb.send(
    new UpdateItemCommand({
      TableName: PRINT_ORDERS_TABLE,
      Key: marshall({ id: orderId }),
      UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: marshall({
        ":status": "manual_fulfillment_needed",
        ":updatedAt": new Date().toISOString(),
      }),
    })
  );
}
