/**
 * Stripe Webhook Handler
 *
 * POST /api/webhooks/stripe - Handle Stripe events
 *
 * Events handled:
 * - checkout.session.completed: New subscription
 * - customer.subscription.updated: Plan changes
 * - customer.subscription.deleted: Cancellation
 * - invoice.paid: Successful payment
 * - invoice.payment_failed: Failed payment
 */

import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, GetCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import Stripe from "stripe";

// SES client for email notifications
const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
});

// Lazy-loaded Stripe client to avoid build-time errors when env vars aren't set
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return _stripe;
}

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Plan mapping from Stripe price IDs
const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_PRICE_STARTER_MONTHLY || ""]: "starter",
  [process.env.STRIPE_PRICE_STARTER_YEARLY || ""]: "starter",
  [process.env.STRIPE_PRICE_PRO_MONTHLY || ""]: "pro",
  [process.env.STRIPE_PRICE_PRO_YEARLY || ""]: "pro",
  [process.env.STRIPE_PRICE_BUSINESS_MONTHLY || ""]: "business",
  [process.env.STRIPE_PRICE_BUSINESS_YEARLY || ""]: "business",
};

// Credits per plan
const PLAN_CREDITS: Record<string, number> = {
  free: 5,
  starter: 25,
  pro: 100,
  business: -1, // Unlimited
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  }catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout - new subscription
 */
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!userId) {
    console.error("No user ID in checkout session");
    return;
  }

  // Get subscription details
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;
  const plan = PRICE_TO_PLAN[priceId] || "free";
  const credits = PLAN_CREDITS[plan] || 5;

  const now = new Date().toISOString();

  await docClient.send(
    new UpdateCommand({
      TableName: process.env.DYNAMODB_USERS_TABLE,
      Key: { id: userId },
      UpdateExpression: `SET
        stripeCustomerId = :customerId,
        stripeSubscriptionId = :subscriptionId,
        plan = :plan,
        creditsRemaining = :credits,
        subscriptionStatus = :status,
        subscriptionCurrentPeriodEnd = :periodEnd,
        updatedAt = :updatedAt
      `,
      ExpressionAttributeValues: {
        ":customerId": customerId,
        ":subscriptionId": subscriptionId,
        ":plan": plan,
        ":credits": credits,
        ":status": subscription.status,
        ":periodEnd": new Date(subscription.current_period_end * 1000).toISOString(),
        ":updatedAt": now,
      },
    })
  );

  console.log(`User ${userId} subscribed to ${plan} plan`);
}

/**
 * Handle subscription updates (plan changes, renewals)
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  // In production, use a GSI on stripeCustomerId
  const userId = await findUserByStripeCustomer(customerId);
  if (!userId) {
    console.error("No user found for customer:", customerId);
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const plan = PRICE_TO_PLAN[priceId] || "free";
  const credits = PLAN_CREDITS[plan] || 5;
  const now = new Date().toISOString();

  await docClient.send(
    new UpdateCommand({
      TableName: process.env.DYNAMODB_USERS_TABLE,
      Key: { id: userId },
      UpdateExpression: `SET
        plan = :plan,
        creditsRemaining = :credits,
        subscriptionStatus = :status,
        subscriptionCurrentPeriodEnd = :periodEnd,
        updatedAt = :updatedAt
      `,
      ExpressionAttributeValues: {
        ":plan": plan,
        ":credits": credits,
        ":status": subscription.status,
        ":periodEnd": new Date(subscription.current_period_end * 1000).toISOString(),
        ":updatedAt": now,
      },
    })
  );

  console.log(`User ${userId} subscription updated to ${plan}`);
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const userId = await findUserByStripeCustomer(customerId);

  if (!userId) {
    console.error("No user found for customer:", customerId);
    return;
  }

  const now = new Date().toISOString();

  await docClient.send(
    new UpdateCommand({
      TableName: process.env.DYNAMODB_USERS_TABLE,
      Key: { id: userId },
      UpdateExpression: `SET
        plan = :plan,
        creditsRemaining = :credits,
        subscriptionStatus = :status,
        updatedAt = :updatedAt
      `,
      ExpressionAttributeValues: {
        ":plan": "free",
        ":credits": 5,
        ":status": "canceled",
        ":updatedAt": now,
      },
    })
  );

  console.log(`User ${userId} subscription canceled, reverted to free`);
}

/**
 * Handle successful invoice payment - refresh credits
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const userId = await findUserByStripeCustomer(customerId);

  if (!userId) return;

  // Get user's current plan
  const userResult = await docClient.send(
    new GetCommand({
      TableName: process.env.DYNAMODB_USERS_TABLE,
      Key: { id: userId },
      ProjectionExpression: "plan",
    })
  );

  const plan = userResult.Item?.plan || "free";
  const credits = PLAN_CREDITS[plan] || 5;

  await docClient.send(
    new UpdateCommand({
      TableName: process.env.DYNAMODB_USERS_TABLE,
      Key: { id: userId },
      UpdateExpression: `SET creditsRemaining = :credits, updatedAt = :updatedAt`,
      ExpressionAttributeValues: {
        ":credits": credits,
        ":updatedAt": new Date().toISOString(),
      },
    })
  );

  console.log(`User ${userId} credits refreshed to ${credits}`);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const userId = await findUserByStripeCustomer(customerId);

  if (!userId) return;

  await docClient.send(
    new UpdateCommand({
      TableName: process.env.DYNAMODB_USERS_TABLE,
      Key: { id: userId },
      UpdateExpression: `SET
        subscriptionStatus = :status,
        paymentFailedAt = :failedAt,
        updatedAt = :updatedAt
      `,
      ExpressionAttributeValues: {
        ":status": "past_due",
        ":failedAt": new Date().toISOString(),
        ":updatedAt": new Date().toISOString(),
      },
    })
  );

  console.log(`User ${userId} payment failed`);

  // Send email notification about failed payment
  await sendPaymentFailedEmail(userId, invoice);
}

/**
 * Find user by Stripe customer ID
 * Uses GSI on stripeCustomerId if available, falls back to scan
 */
async function findUserByStripeCustomer(customerId: string): Promise<string | null> {
  if (!customerId) return null;

  try {
    // Try GSI query first (recommended for production)
    try {
      const queryResult = await docClient.send(
        new QueryCommand({
          TableName: process.env.DYNAMODB_USERS_TABLE,
          IndexName: "stripeCustomerId-index",
          KeyConditionExpression: "stripeCustomerId = :customerId",
          ExpressionAttributeValues: {
            ":customerId": customerId,
          },
          Limit: 1,
        })
      );

      if (queryResult.Items && queryResult.Items.length > 0) {
        return queryResult.Items[0].id;
      }
    } catch (gsiError: unknown) {
      // GSI might not exist, fall back to scan
      const errorMessage = gsiError instanceof Error ? gsiError.message : String(gsiError);
      if (!errorMessage.includes("ValidationException")) {
        throw gsiError;
      }
    }

    // Fallback to scan (less efficient but works without GSI)
    const scanResult = await docClient.send(
      new ScanCommand({
        TableName: process.env.DYNAMODB_USERS_TABLE,
        FilterExpression: "stripeCustomerId = :customerId",
        ExpressionAttributeValues: {
          ":customerId": customerId,
        },
        Limit: 100, // Scan limit to prevent full table scan
      })
    );

    if (scanResult.Items && scanResult.Items.length > 0) {
      return scanResult.Items[0].id;
    }

    console.warn(`No user found for Stripe customer: ${customerId}`);
    return null;
  } catch (error) {
    console.error("Error finding user by Stripe customer:", error);
    return null;
  }
}

/**
 * Send payment failure notification email
 */
async function sendPaymentFailedEmail(userId: string, invoice: Stripe.Invoice): Promise<void> {
  try {
    // Get user email
    const userResult = await docClient.send(
      new GetCommand({
        TableName: process.env.DYNAMODB_USERS_TABLE,
        Key: { id: userId },
        ProjectionExpression: "email, #name",
        ExpressionAttributeNames: { "#name": "name" },
      })
    );

    if (!userResult.Item?.email) {
      console.error("No email found for user:", userId);
      return;
    }

    const userEmail = userResult.Item.email;
    const userName = userResult.Item.name || "there";
    const amount = invoice.amount_due ? (invoice.amount_due / 100).toFixed(2) : "0.00";
    const currency = (invoice.currency || "usd").toUpperCase();

    const emailParams = {
      Source: process.env.SES_FROM_EMAIL || "noreply@invitegenerator.com",
      Destination: {
        ToAddresses: [userEmail],
      },
      Message: {
        Subject: {
          Data: "Action Required: Payment Failed for Your InviteGenerator Subscription",
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #FF6B47; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .button { display: inline-block; background: #FF6B47; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Failed</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <p>We were unable to process your payment of <strong>${currency} ${amount}</strong> for your InviteGenerator subscription.</p>
      <p>To keep your subscription active and continue enjoying premium features, please update your payment method.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://invitegenerator.com"}/dashboard/billing" class="button">Update Payment Method</a></p>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>The InviteGenerator Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} InviteGenerator. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
            `,
            Charset: "UTF-8",
          },
          Text: {
            Data: `Hi ${userName},

We were unable to process your payment of ${currency} ${amount} for your InviteGenerator subscription.

To keep your subscription active, please update your payment method at:
${process.env.NEXT_PUBLIC_APP_URL || "https://invitegenerator.com"}/dashboard/billing

If you have any questions, please contact our support team.

Best regards,
The InviteGenerator Team`,
            Charset: "UTF-8",
          },
        },
      },
    };

    await sesClient.send(new SendEmailCommand(emailParams));
    console.log(`Payment failure email sent to ${userEmail}`);
  } catch (error) {
    console.error("Failed to send payment failure email:", error);
    // Don't throw - email failure shouldn't break the webhook
  }
}
