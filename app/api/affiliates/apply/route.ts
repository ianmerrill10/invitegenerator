import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, API_RATE_LIMIT } from "@/lib/rate-limit";
import { AffiliateService } from "@/lib/services/affiliate-service";
import { sanitizeText } from "@/lib/security";

// POST /api/affiliates/apply - Submit affiliate application (public)
export async function POST(request: NextRequest) {
  const rateLimit = applyRateLimit(request, API_RATE_LIMIT);
  if (rateLimit.error) {
    return NextResponse.json(
      { success: false, error: { code: "RATE_LIMITED", message: rateLimit.error.message } },
      { status: rateLimit.error.status, headers: rateLimit.headers }
    );
  }

  try {
    const body = await request.json();
    const {
      email,
      name,
      website,
      socialMedia,
      audience,
      promotionPlan,
      monthlyTraffic,
      niche,
    } = body;

    // Validate required fields
    if (!email || !name || !audience || !promotionPlan || !niche) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Missing required fields" } },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid email format" } },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const application = await AffiliateService.submitApplication({
      email: sanitizeText(email, 254),
      name: sanitizeText(name, 100),
      website: website ? sanitizeText(website, 500) : undefined,
      socialMedia: socialMedia ? {
        instagram: socialMedia.instagram ? sanitizeText(socialMedia.instagram, 100) : undefined,
        twitter: socialMedia.twitter ? sanitizeText(socialMedia.twitter, 100) : undefined,
        youtube: socialMedia.youtube ? sanitizeText(socialMedia.youtube, 200) : undefined,
        tiktok: socialMedia.tiktok ? sanitizeText(socialMedia.tiktok, 100) : undefined,
        linkedin: socialMedia.linkedin ? sanitizeText(socialMedia.linkedin, 200) : undefined,
      } : undefined,
      audience: sanitizeText(audience, 1000),
      promotionPlan: sanitizeText(promotionPlan, 2000),
      monthlyTraffic: monthlyTraffic ? sanitizeText(monthlyTraffic, 50) : undefined,
      niche: sanitizeText(niche, 100),
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: { code: "SERVER_ERROR", message: "Failed to submit application" } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        applicationId: application.id,
        status: application.status,
      },
      message: "Application submitted successfully! We'll review it and get back to you within 24-48 hours.",
    });
  } catch (error) {
    console.error("Submit application error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to submit application" } },
      { status: 500 }
    );
  }
}
