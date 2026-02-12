import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { applyRateLimit, API_RATE_LIMIT } from "@/lib/rate-limit";
import { AffiliateService, AFFILIATE_TIERS } from "@/lib/services/affiliate-service";

function errorResponse(message: string, code: string = "AFFILIATE_ERROR", status: number = 400) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  );
}

// GET /api/affiliates - Get current user's affiliate data
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }

    const affiliate = await AffiliateService.getAffiliateByUserId(auth.userId);

    if (!affiliate) {
      return NextResponse.json({
        success: true,
        data: null,
        isAffiliate: false,
      });
    }

    // Get tier config
    const tierConfig = AFFILIATE_TIERS.find(t => t.tier === affiliate.tier);

    // Get recent referrals
    const referrals = await AffiliateService.getReferrals(affiliate.id);

    // Get commissions
    const commissions = await AffiliateService.getCommissions(affiliate.id);

    // Get payouts
    const payouts = await AffiliateService.getPayouts(affiliate.id);

    // Generate affiliate link
    const affiliateLink = AffiliateService.generateAffiliateLink(affiliate.code);

    return NextResponse.json({
      success: true,
      data: {
        affiliate,
        tierConfig,
        referrals: referrals.slice(0, 50), // Last 50
        commissions: commissions.slice(0, 50),
        payouts: payouts.slice(0, 20),
        affiliateLink,
        allTiers: AFFILIATE_TIERS,
      },
      isAffiliate: true,
    });
  } catch (error) {
    console.error("Get affiliate error:", error);
    return errorResponse("Failed to fetch affiliate data", "SERVER_ERROR", 500);
  }
}

// POST /api/affiliates - Join affiliate program
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

    // Check if already an affiliate
    const existing = await AffiliateService.getAffiliateByUserId(auth.userId);
    if (existing) {
      return errorResponse("You are already an affiliate", "ALREADY_AFFILIATE", 400);
    }

    const body = await request.json();
    const { name, payoutMethod = "paypal" } = body;

    if (!name || name.length < 2 || name.length > 50) {
      return errorResponse("Name must be between 2 and 50 characters");
    }

    // Create affiliate account
    const affiliate = await AffiliateService.createAffiliate(
      auth.userId,
      name,
      payoutMethod
    );

    if (!affiliate) {
      return errorResponse("Failed to create affiliate account", "SERVER_ERROR", 500);
    }

    const affiliateLink = AffiliateService.generateAffiliateLink(affiliate.code);
    const tierConfig = AFFILIATE_TIERS.find(t => t.tier === affiliate.tier);

    return NextResponse.json({
      success: true,
      data: {
        affiliate,
        affiliateLink,
        tierConfig,
      },
    });
  } catch (error) {
    console.error("Create affiliate error:", error);
    return errorResponse("Failed to join affiliate program", "SERVER_ERROR", 500);
  }
}

// PATCH /api/affiliates - Update affiliate settings
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }

    const affiliate = await AffiliateService.getAffiliateByUserId(auth.userId);
    if (!affiliate) {
      return errorResponse("Not an affiliate", "NOT_AFFILIATE", 404);
    }

    const body = await request.json();
    const { payoutMethod, payoutDetails, customSlug } = body;

    const updates: Record<string, unknown> = {};

    if (payoutMethod) {
      updates.payoutMethod = payoutMethod;
    }

    if (payoutDetails) {
      updates.payoutDetails = payoutDetails;
    }

    if (customSlug) {
      // Validate custom slug
      if (!/^[a-zA-Z0-9-_]{3,20}$/.test(customSlug)) {
        return errorResponse("Custom slug must be 3-20 alphanumeric characters");
      }
      updates.customSlug = customSlug;
    }

    const success = await AffiliateService.updateAffiliate(affiliate.id, updates);

    if (!success) {
      return errorResponse("Failed to update affiliate settings", "SERVER_ERROR", 500);
    }

    const updated = await AffiliateService.getAffiliate(affiliate.id);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Update affiliate error:", error);
    return errorResponse("Failed to update settings", "SERVER_ERROR", 500);
  }
}
