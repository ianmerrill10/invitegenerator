import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import {
  listAvailableCampaigns,
  scheduleAutomatedCampaign,
  getUserCampaigns,
  getPendingCampaigns,
  CampaignTrigger,
} from "@/lib/automation/campaigns";
import type { CustomerProfile } from "@/lib/automation/campaigns";

// Helper to create error response
function errorResponse(message: string, code: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status }
  );
}

// GET /api/marketing/campaigns - List available campaigns or user's campaign history
export async function GET(request: NextRequest) {
  try {
    const auth = (await verifyAuth(request)) as {
      authenticated: boolean;
      userId: string | null;
      email?: string;
    };
    if (!auth.authenticated || !auth.userId) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    // Return list of available campaign configurations
    if (view === "available") {
      const campaigns = listAvailableCampaigns();
      return NextResponse.json({
        success: true,
        data: { campaigns },
      });
    }

    // Return pending campaigns (admin use)
    if (view === "pending") {
      const pending = await getPendingCampaigns();
      return NextResponse.json({
        success: true,
        data: { campaigns: pending, total: pending.length },
      });
    }

    // Default: return user's campaign history
    const campaigns = await getUserCampaigns(auth.userId);

    return NextResponse.json({
      success: true,
      data: {
        campaigns,
        total: campaigns.length,
      },
    });
  } catch (error) {
    console.error("Get campaigns error:", error);
    return errorResponse(
      "Failed to fetch campaigns",
      "CAMPAIGNS_FETCH_ERROR",
      500
    );
  }
}

// POST /api/marketing/campaigns - Trigger a campaign for a user
export async function POST(request: NextRequest) {
  try {
    const auth = (await verifyAuth(request)) as {
      authenticated: boolean;
      userId: string | null;
      email?: string;
    };
    if (!auth.authenticated || !auth.userId) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }

    const body = await request.json();
    const { campaignKey, targetUserId, targetEmail, targetName, additionalData } =
      body;

    // Validate required fields
    if (!campaignKey || typeof campaignKey !== "string") {
      return errorResponse(
        "Campaign key is required",
        "MISSING_CAMPAIGN_KEY"
      );
    }

    // Validate campaign key is known
    const available = listAvailableCampaigns();
    const campaignConfig = available.find((c) => c.key === campaignKey);
    if (!campaignConfig) {
      return errorResponse(
        `Unknown campaign key: ${campaignKey}. Available: ${available.map((c) => c.key).join(", ")}`,
        "INVALID_CAMPAIGN_KEY"
      );
    }

    // Build customer profile
    const profile: CustomerProfile = {
      userId: targetUserId || auth.userId,
      email: targetEmail || auth.email || "",
      firstName: targetName || "there",
      marketingConsent: {
        email: true, // Assume consent when triggered via API
      },
    };

    if (!profile.email) {
      return errorResponse(
        "Target email is required",
        "MISSING_TARGET_EMAIL"
      );
    }

    // Schedule the campaign
    const result = await scheduleAutomatedCampaign(
      campaignKey,
      profile,
      additionalData
    );

    if (result.success) {
      console.info("Campaign triggered via API", {
        campaignKey,
        targetUserId: profile.userId,
        scheduledFor: result.scheduledFor,
      });

      return NextResponse.json({
        success: true,
        data: {
          campaignKey,
          trigger: campaignConfig.trigger,
          scheduledFor: result.scheduledFor,
          targetEmail: profile.email,
        },
      });
    }

    return errorResponse(
      result.error || "Failed to schedule campaign",
      "CAMPAIGN_SCHEDULE_ERROR",
      500
    );
  } catch (error) {
    console.error("Trigger campaign error:", error);
    return errorResponse(
      "Failed to trigger campaign",
      "CAMPAIGN_TRIGGER_ERROR",
      500
    );
  }
}
