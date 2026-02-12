import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { applyRateLimit, API_RATE_LIMIT } from "@/lib/rate-limit";
import { AffiliateService } from "@/lib/services/affiliate-service";

function errorResponse(message: string, code: string = "PAYOUT_ERROR", status: number = 400) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  );
}

// GET /api/affiliates/payout - Get payout history
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }

    const affiliate = await AffiliateService.getAffiliateByUserId(auth.userId);
    if (!affiliate) {
      return errorResponse("Not an affiliate", "NOT_AFFILIATE", 404);
    }

    const payouts = await AffiliateService.getPayouts(affiliate.id);

    return NextResponse.json({
      success: true,
      data: {
        payouts,
        pendingBalance: affiliate.stats.pendingEarnings,
        minimumPayout: 50,
        canRequestPayout: affiliate.stats.pendingEarnings >= 50,
      },
    });
  } catch (error) {
    console.error("Get payouts error:", error);
    return errorResponse("Failed to fetch payouts", "SERVER_ERROR", 500);
  }
}

// POST /api/affiliates/payout - Request a payout
export async function POST(request: NextRequest) {
  const rateLimit = applyRateLimit(request, API_RATE_LIMIT);
  if (rateLimit.error) {
    return NextResponse.json(
      { success: false, error: { code: "RATE_LIMITED", message: rateLimit.error.message } },
      { status: rateLimit.error.status, headers: rateLimit.headers }
    );
  }

  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }

    const affiliate = await AffiliateService.getAffiliateByUserId(auth.userId);
    if (!affiliate) {
      return errorResponse("Not an affiliate", "NOT_AFFILIATE", 404);
    }

    // Check minimum payout threshold
    if (affiliate.stats.pendingEarnings < 50) {
      return errorResponse(
        `Minimum payout is $50. You have $${affiliate.stats.pendingEarnings.toFixed(2)} pending.`,
        "BELOW_MINIMUM",
        400
      );
    }

    // Check if payout method is configured
    if (!affiliate.payoutDetails || Object.keys(affiliate.payoutDetails).length === 0) {
      return errorResponse(
        "Please configure your payout method before requesting a payout",
        "NO_PAYOUT_METHOD",
        400
      );
    }

    const payout = await AffiliateService.requestPayout(affiliate.id);

    if (!payout) {
      return errorResponse("Failed to request payout", "SERVER_ERROR", 500);
    }

    return NextResponse.json({
      success: true,
      data: payout,
      message: `Payout of $${payout.amount.toFixed(2)} requested successfully. You'll receive it within 3-5 business days.`,
    });
  } catch (error) {
    console.error("Request payout error:", error);
    return errorResponse("Failed to request payout", "SERVER_ERROR", 500);
  }
}
