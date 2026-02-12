import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { getUserById } from "@/services/aws/dynamodb";
import { getOrCreateCustomer, createPortalSession } from "@/services/stripe";
import { applyRateLimit, API_RATE_LIMIT } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimit = applyRateLimit(request, API_RATE_LIMIT);
  if (rateLimit.error) {
    return NextResponse.json(
      { error: rateLimit.error.message },
      { status: rateLimit.error.status, headers: rateLimit.headers }
    );
  }

  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null; email?: string };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await getUserById(auth.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateCustomer(
      user.email,
      user.name,
      user.id
    );

    // Create portal session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const portalUrl = await createPortalSession(
      customerId,
      `${appUrl}/dashboard/billing`
    );

    if (!portalUrl) {
      return NextResponse.json(
        { error: "Failed to create portal session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
