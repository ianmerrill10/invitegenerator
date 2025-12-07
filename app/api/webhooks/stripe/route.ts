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
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

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
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
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
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
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

  // TODO: Send email notification about failed payment
}

/**
 * Find user by Stripe customer ID
 * In production, use a GSI on stripeCustomerId
 */
async function findUserByStripeCustomer(customerId: string): Promise<string | null> {
  // This is a placeholder - in production, use a GSI query
  // For now, we'll need to scan or maintain a separate mapping table
  console.log("Looking up user for Stripe customer:", customerId);
  return null;
}
