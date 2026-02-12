import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { getUserById } from "@/services/aws/dynamodb";
import { getOrCreateCustomer, createCheckoutSession } from "@/services/stripe";
import { logAuditEvent, getClientIP } from "@/lib/audit-log";
import { applyRateLimit, API_RATE_LIMIT } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimit = applyRateLimit(request, API_RATE_LIMIT);
  if (rateLimit.error) {
    return NextResponse.json(
      { success: false, error: { code: "RATE_LIMITED", message: rateLimit.error.message } },
      { status: rateLimit.error.status, headers: rateLimit.headers }
    );
  }

  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null; email?: string };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { priceId, interval = "monthly" } = body;

    // Validate plan
    const validPlans = ["starter", "pro", "business"];
    if (!priceId || !validPlans.includes(priceId)) {
      return NextResponse.json(
        { success: false, error: { code: "BILLING_ERROR", message: "Invalid plan selected" } },
        { status: 400 }
      );
    }

    // Validate interval
    const validIntervals = ["monthly", "yearly"];
    if (!validIntervals.includes(interval)) {
      return NextResponse.json(
        { success: false, error: { code: "BILLING_ERROR", message: "Invalid billing interval. Must be 'monthly' or 'yearly'." } },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await getUserById(auth.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateCustomer(
      user.email,
      user.name,
      user.id
    );

    // Create checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkoutUrl = await createCheckoutSession(
      customerId,
      priceId as "starter" | "pro" | "business",
      interval as "monthly" | "yearly",
      `${appUrl}/dashboard/billing?success=true`,
      `${appUrl}/dashboard/billing?canceled=true`
    );

    if (!checkoutUrl) {
      return NextResponse.json(
        { success: false, error: { code: "BILLING_ERROR", message: "Failed to create checkout session" } },
        { status: 500 }
      );
    }

    // Log billing event
    logAuditEvent("billing.subscription.created", {
      userId: auth.userId,
      ipAddress: getClientIP(request),
      outcome: "success",
      details: { priceId, interval },
    }).catch(console.error);

    return NextResponse.json({ success: true, data: { url: checkoutUrl } });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { success: false, error: { code: "BILLING_ERROR", message: "Failed to create checkout session" } },
      { status: 500 }
    );
  }
}
