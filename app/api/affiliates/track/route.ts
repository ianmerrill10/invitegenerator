import { NextRequest, NextResponse } from "next/server";
import { AffiliateService } from "@/lib/services/affiliate-service";

// POST /api/affiliates/track - Track affiliate click (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, source, landingPage } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_CODE", message: "Affiliate code required" } },
        { status: 400 }
      );
    }

    // Get IP and user agent
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] ||
                      request.headers.get("x-real-ip") ||
                      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const referral = await AffiliateService.trackClick(
      code,
      source || "direct",
      landingPage || "/",
      ipAddress,
      userAgent
    );

    if (!referral) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CODE", message: "Invalid or inactive affiliate code" } },
        { status: 400 }
      );
    }

    // Return referral ID to store in cookie
    return NextResponse.json({
      success: true,
      data: {
        referralId: referral.id,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      },
    });
  } catch (error) {
    console.error("Track affiliate click error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to track click" } },
      { status: 500 }
    );
  }
}
