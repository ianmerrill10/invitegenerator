// ============================================
// STRIPE SERVICE
// Payment and subscription handling
// ============================================

import Stripe from 'stripe';
import type { UserPlan, PlanFeatures } from '@/types';

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  if (!stripeClient) {
    stripeClient = new Stripe(apiKey, {
      apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
    });
  }

  return stripeClient;
}

// Plan configuration
export const PLAN_FEATURES: Record<UserPlan, PlanFeatures> = {
  free: {
    plan: 'free',
    name: 'Free',
    price: 0,
    priceYearly: 0,
    invitationsPerMonth: 3,
    aiCreditsPerMonth: 5,
    guestsPerInvitation: 50,
    customBranding: false,
    premiumTemplates: false,
    analytics: false,
    prioritySupport: false,
    apiAccess: false,
    teamMembers: 1,
    features: [
      '3 invitations per month',
      '5 AI credits per month',
      'Up to 50 guests per invitation',
      'Basic templates',
      'Email support',
    ],
  },
  starter: {
    plan: 'starter',
    name: 'Starter',
    price: 9,
    priceYearly: 90,
    invitationsPerMonth: 10,
    aiCreditsPerMonth: 25,
    guestsPerInvitation: 150,
    customBranding: false,
    premiumTemplates: true,
    analytics: true,
    prioritySupport: false,
    apiAccess: false,
    teamMembers: 1,
    features: [
      '10 invitations per month',
      '25 AI credits per month',
      'Up to 150 guests per invitation',
      'Premium templates',
      'Basic analytics',
      'Remove watermark',
    ],
  },
  pro: {
    plan: 'pro',
    name: 'Pro',
    price: 29,
    priceYearly: 290,
    invitationsPerMonth: 50,
    aiCreditsPerMonth: 100,
    guestsPerInvitation: 500,
    customBranding: true,
    premiumTemplates: true,
    analytics: true,
    prioritySupport: true,
    apiAccess: false,
    teamMembers: 3,
    features: [
      '50 invitations per month',
      '100 AI credits per month',
      'Up to 500 guests per invitation',
      'All premium templates',
      'Advanced analytics',
      'Custom branding',
      'Priority support',
      '3 team members',
    ],
  },
  business: {
    plan: 'business',
    name: 'Business',
    price: 79,
    priceYearly: 790,
    invitationsPerMonth: -1, // Unlimited
    aiCreditsPerMonth: 500,
    guestsPerInvitation: -1, // Unlimited
    customBranding: true,
    premiumTemplates: true,
    analytics: true,
    prioritySupport: true,
    apiAccess: true,
    teamMembers: 10,
    features: [
      'Unlimited invitations',
      '500 AI credits per month',
      'Unlimited guests',
      'All premium templates',
      'Advanced analytics & reports',
      'Custom branding & domain',
      'Priority support',
      '10 team members',
      'API access',
    ],
  },
};

// Price IDs from environment
const PRICE_IDS = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_STARTER_YEARLY || '',
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY || '',
  },
  business: {
    monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY || '',
  },
};

/**
 * Create or get Stripe customer
 */
export async function getOrCreateCustomer(
  email: string,
  name: string,
  userId: string
): Promise<string> {
  // Search for existing customer
  const customers = await getStripe().customers.list({
    email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    return customers.data[0].id;
  }

  // Create new customer
  const customer = await getStripe().customers.create({
    email,
    name,
    metadata: { userId },
  });

  return customer.id;
}

/**
 * Create checkout session for subscription
 */
export async function createCheckoutSession(
  customerId: string,
  plan: 'starter' | 'pro' | 'business',
  interval: 'monthly' | 'yearly',
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const priceId = PRICE_IDS[plan][interval];

  if (!priceId) {
    throw new Error(`Price ID not configured for ${plan} ${interval}`);
  }

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
  });

  return session.url || '';
}

/**
 * Create customer portal session
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}

/**
 * Get subscription details
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    return await getStripe().subscriptions.retrieve(subscriptionId);
  } catch {
    return null;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<boolean> {
  try {
    await getStripe().subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });
    return true;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return false;
  }
}

/**
 * Resume subscription (undo cancellation)
 */
export async function resumeSubscription(subscriptionId: string): Promise<boolean> {
  try {
    await getStripe().subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
    return true;
  } catch (error) {
    console.error('Error resuming subscription:', error);
    return false;
  }
}

/**
 * Get customer invoices
 */
export async function getCustomerInvoices(
  customerId: string,
  limit: number = 10
): Promise<Stripe.Invoice[]> {
  const invoices = await getStripe().invoices.list({
    customer: customerId,
    limit,
  });

  return invoices.data;
}

/**
 * Webhook signature verification
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  return getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Get plan from price ID
 */
export function getPlanFromPriceId(priceId: string): UserPlan | null {
  for (const [plan, prices] of Object.entries(PRICE_IDS)) {
    if (prices.monthly === priceId || prices.yearly === priceId) {
      return plan as UserPlan;
    }
  }
  return null;
}

/**
 * Create one-time payment for add-on credits
 */
export async function createCreditsCheckout(
  customerId: string,
  creditAmount: number,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${creditAmount} AI Credits`,
            description: 'Additional AI credits for invitation generation',
          },
          unit_amount: creditAmount * 10, // $0.10 per credit
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      type: 'credits',
      amount: creditAmount.toString(),
    },
  });

  return session.url || '';
}
