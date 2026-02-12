import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent, getPlanFromPriceId } from "@/services/stripe";
import { getUserByEmail, updateUser } from "@/services/aws/dynamodb";
import { sendPaymentReceiptEmail, sendPaymentFailedEmail, sendOrderConfirmationEmail } from "@/lib/email";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
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
      event = constructWebhookEvent(body, signature);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        // Log unhandled events at debug level (visible in development only)
        if (process.env.NODE_ENV === "development") {
          console.info(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_details?.email;
  if (!customerEmail) {
    console.error("No customer email in checkout session");
    return;
  }

  // Get user by email
  const user = await getUserByEmail(customerEmail);
  if (!user) {
    console.error(`User not found for email: ${customerEmail}`);
    return;
  }

  // Handle credits purchase
  if (session.metadata?.type === "credits") {
    const creditAmount = parseInt(session.metadata.amount || "0", 10);
    await updateUser(user.id, {
      creditsRemaining: user.creditsRemaining + creditAmount,
      updatedAt: new Date().toISOString(),
    });
    console.info(`[Stripe Webhook] Added ${creditAmount} credits to user ${user.id}`);
  }

  // Handle print order payment
  if (session.metadata?.type === "print_order") {
    const { orderId, invitationId, userId } = session.metadata;
    if (orderId && invitationId && userId) {
      const { handlePaymentSuccess } = await import("@/lib/services/print-order-service");
      await handlePaymentSuccess(orderId, invitationId, userId);
      console.info(`[Stripe Webhook] Print order ${orderId} payment processed for user ${userId}`);

      // Send order confirmation email (non-blocking)
      const customerEmail = session.customer_details?.email;
      if (customerEmail) {
        const amount = session.amount_total
          ? new Intl.NumberFormat("en-US", { style: "currency", currency: session.currency || "usd" }).format(session.amount_total / 100)
          : "N/A";
        sendOrderConfirmationEmail(customerEmail, orderId, "Print Order", amount).catch(console.error);
      }
    }
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerEmail = await getCustomerEmail(subscription.customer as string);
  if (!customerEmail) return;

  const user = await getUserByEmail(customerEmail);
  if (!user) {
    console.error(`User not found for email: ${customerEmail}`);
    return;
  }

  // Get the price ID from the subscription
  const priceId = subscription.items.data[0]?.price?.id;
  if (!priceId) return;

  // Determine the plan from the price ID
  const plan = getPlanFromPriceId(priceId);
  if (!plan) {
    console.error(`Unknown price ID: ${priceId}`);
    return;
  }

  // Update user plan
  await updateUser(user.id, {
    plan,
    updatedAt: new Date().toISOString(),
  });

  console.info(`[Stripe Webhook] Updated user ${user.id} to plan: ${plan}`);
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerEmail = await getCustomerEmail(subscription.customer as string);
  if (!customerEmail) return;

  const user = await getUserByEmail(customerEmail);
  if (!user) {
    console.error(`User not found for email: ${customerEmail}`);
    return;
  }

  // Downgrade to free plan
  await updateUser(user.id, {
    plan: "free",
    updatedAt: new Date().toISOString(),
  });

  console.info(`[Stripe Webhook] Downgraded user ${user.id} to free plan`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.info(`[Stripe Webhook] Payment succeeded for invoice: ${invoice.id}`);

  // Send receipt email
  const email = invoice.customer_email;
  if (email && invoice.amount_paid > 0) {
    await sendPaymentReceiptEmail(
      email,
      invoice.id,
      invoice.amount_paid,
      invoice.currency
    );
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.warn(`[Stripe Webhook] Payment failed for invoice: ${invoice.id}`);

  // Send payment failed notification
  const email = invoice.customer_email;
  if (email) {
    await sendPaymentFailedEmail(
      email,
      invoice.id,
      invoice.amount_due,
      invoice.currency
    );
  }
}

async function getCustomerEmail(customerId: string): Promise<string | null> {
  try {
    // Import Stripe dynamically to avoid circular dependencies
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-02-24.acacia",
    });

    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    return customer.email;
  } catch (error) {
    console.error("Error getting customer email:", error);
    return null;
  }
}
