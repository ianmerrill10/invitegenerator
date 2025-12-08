import { NextRequest, NextResponse } from "next/server";
import { EVENT_WEBSITE_PRICING, TIER_INCLUSIONS, getEventWebsiteTier } from "@/lib/pricing";
import { EventWebsite, EventWebsiteTier, UserPlan } from "@/types";
import { v4 as uuidv4 } from "uuid";

// GET /api/website - Get website pricing and user's included tier
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userPlan = (searchParams.get("plan") || "free") as UserPlan;

    const includedTier = getEventWebsiteTier(userPlan);

    // Build pricing response with what's included
    const websiteTiers = ["free", "premium", "pro"] as const;
    const tiers = websiteTiers.map((id) => {
      const tier = EVENT_WEBSITE_PRICING[id];
      const isIncluded = includedTier === id ||
        (includedTier === "pro" && id !== "pro") ||
        (includedTier === "premium" && id === "free");

      return {
        id,
        name: tier.name,
        price: tier.price,
        priceYearly: tier.priceYearly,
        features: tier.features,
        limitations: "limitations" in tier ? tier.limitations : [],
        savings: "savings" in tier ? tier.savings : null,
        isIncluded,
        upgradePrice: isIncluded ? 0 : tier.priceYearly,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        tiers,
        userPlan,
        includedTier,
        customDomain: EVENT_WEBSITE_PRICING.customDomain,
        competitorComparison: {
          zola: "$14.95/year",
          joy: "$20/year",
          theKnot: "$19.99/year",
          us: "$9.99/year",
          savings: "Up to 50%",
        },
      },
    });
  } catch (error) {
    console.error("Error fetching website pricing:", error);
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: "Failed to fetch pricing" } },
      { status: 500 }
    );
  }
}

// POST /api/website - Create a new event website
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      invitationId,
      userId,
      subdomain,
      template = "classic",
      tier = "free",
    } = body;

    if (!invitationId || !userId || !subdomain) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "invitationId, userId, and subdomain required" } },
        { status: 400 }
      );
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9][a-z0-9-]{2,30}[a-z0-9]$/;
    if (!subdomainRegex.test(subdomain.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_SUBDOMAIN", message: "Subdomain must be 4-32 characters, lowercase letters, numbers, and hyphens only" } },
        { status: 400 }
      );
    }

    // TODO: Check subdomain availability in database

    const website: EventWebsite = {
      id: uuidv4(),
      invitationId,
      userId,
      subdomain: subdomain.toLowerCase(),
      tier: tier as EventWebsiteTier,
      template,
      settings: {
        passwordProtected: false,
        showRsvp: true,
        showRegistry: false,
        showGallery: true,
        showAccommodations: false,
        showTravel: false,
        showFaq: false,
        showTimeline: false,
        backgroundColor: "#ffffff",
        primaryColor: "#c9a489",
        fontFamily: "Cormorant Garamond",
        showCountdown: true,
      },
      sections: [
        {
          id: uuidv4(),
          type: "hero",
          title: "Welcome",
          content: "",
          order: 0,
          visible: true,
          settings: {},
        },
        {
          id: uuidv4(),
          type: "details",
          title: "Event Details",
          content: "",
          order: 1,
          visible: true,
          settings: {},
        },
        {
          id: uuidv4(),
          type: "rsvp",
          title: "RSVP",
          content: "",
          order: 2,
          visible: true,
          settings: {},
        },
      ],
      seo: {
        title: "",
        description: "",
        noIndex: false,
      },
      analytics: {
        totalViews: 0,
        uniqueVisitors: 0,
        rsvpConversionRate: 0,
        topReferrers: {},
        viewsByDate: [],
      },
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: Save to database

    return NextResponse.json({
      success: true,
      data: {
        website,
        urls: {
          preview: `https://${subdomain}.invitegenerator.com`,
          edit: `/dashboard/website/${website.id}`,
        },
      },
    });
  } catch (error) {
    console.error("Error creating website:", error);
    return NextResponse.json(
      { success: false, error: { code: "CREATE_ERROR", message: "Failed to create website" } },
      { status: 500 }
    );
  }
}
