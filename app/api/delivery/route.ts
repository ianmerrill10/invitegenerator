import { NextRequest, NextResponse } from "next/server";
import {
  DIGITAL_DELIVERY_PRICING,
  TIER_INCLUSIONS,
  calculateDeliveryCreditsNeeded,
} from "@/lib/pricing";
import { DeliveryJob, DeliveryMethod, UserPlan } from "@/types";
import { v4 as uuidv4 } from "uuid";

// GET /api/delivery - Get delivery pricing and user's credit balance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userPlan = (searchParams.get("plan") || "free") as UserPlan;
    const guestCount = parseInt(searchParams.get("guests") || "100", 10);

    const tierInclusions = TIER_INCLUSIONS[userPlan];

    // Calculate costs for different delivery methods
    const methods = {
      email: {
        ...DIGITAL_DELIVERY_PRICING.email,
        totalCost: 0,
        creditsNeeded: 0,
        included: true,
      },
      premiumEmail: {
        ...DIGITAL_DELIVERY_PRICING.premiumEmail,
        totalCost: guestCount * DIGITAL_DELIVERY_PRICING.premiumEmail.costPerRecipient,
        creditsNeeded: guestCount,
        included: tierInclusions.digitalDeliveryCredits >= guestCount || tierInclusions.digitalDeliveryCredits === -1,
      },
      sms: {
        ...DIGITAL_DELIVERY_PRICING.sms,
        totalCost: guestCount * DIGITAL_DELIVERY_PRICING.sms.costPerRecipient,
        creditsNeeded: guestCount,
        included: tierInclusions.smsCredits >= guestCount,
      },
      whatsapp: {
        ...DIGITAL_DELIVERY_PRICING.whatsapp,
        totalCost: guestCount * DIGITAL_DELIVERY_PRICING.whatsapp.costPerRecipient,
        creditsNeeded: guestCount,
        included: false, // WhatsApp not included in any tier, always pay
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        methods,
        creditPacks: DIGITAL_DELIVERY_PRICING.creditPacks,
        userPlan,
        monthlyCredits: {
          digitalDelivery: tierInclusions.digitalDeliveryCredits,
          sms: tierInclusions.smsCredits,
        },
        competitorPricing: {
          paperlessPost: "$0.18/guest",
          greenvelope: "$0.95/invite",
          us: "$0.05-0.08/guest",
          savings: "Up to 75%",
        },
      },
    });
  } catch (error) {
    console.error("Error fetching delivery pricing:", error);
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: "Failed to fetch pricing" } },
      { status: 500 }
    );
  }
}

// POST /api/delivery - Create a new delivery job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      invitationId,
      userId,
      method,
      recipients,
      scheduledFor,
    } = body;

    if (!invitationId || !userId || !method || !recipients?.length) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "invitationId, userId, method, and recipients required" } },
        { status: 400 }
      );
    }

    // Validate method
    const validMethods: DeliveryMethod[] = ["email", "premiumEmail", "sms", "whatsapp"];
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_METHOD", message: "Invalid delivery method" } },
        { status: 400 }
      );
    }

    // Validate recipients have required contact info
    for (const recipient of recipients) {
      if (!recipient.name) {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_RECIPIENT", message: "All recipients must have a name" } },
          { status: 400 }
        );
      }
      if ((method === "email" || method === "premiumEmail") && !recipient.email) {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_RECIPIENT", message: "Email recipients must have an email address" } },
          { status: 400 }
        );
      }
      if ((method === "sms" || method === "whatsapp") && !recipient.phone) {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_RECIPIENT", message: "SMS/WhatsApp recipients must have a phone number" } },
          { status: 400 }
        );
      }
    }

    // TODO: Check user's credit balance and deduct credits

    const deliveryJob: DeliveryJob = {
      id: uuidv4(),
      invitationId,
      userId,
      method,
      status: scheduledFor ? "scheduled" : "pending",
      recipients: recipients.map((r: { name: string; email?: string; phone?: string }) => ({
        id: uuidv4(),
        name: r.name,
        email: r.email,
        phone: r.phone,
        status: "pending" as const,
      })),
      scheduledFor,
      stats: {
        total: recipients.length,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        failed: 0,
        bounced: 0,
      },
      createdAt: new Date().toISOString(),
    };

    // TODO: Save to database and queue for processing

    // Calculate cost
    const costPerRecipient = DIGITAL_DELIVERY_PRICING[method as keyof typeof DIGITAL_DELIVERY_PRICING];
    const cost = "costPerRecipient" in costPerRecipient
      ? recipients.length * costPerRecipient.costPerRecipient
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        job: deliveryJob,
        cost,
        creditsUsed: method === "email" ? 0 : recipients.length,
        estimatedDelivery: scheduledFor || "Within 5 minutes",
      },
    });
  } catch (error) {
    console.error("Error creating delivery job:", error);
    return NextResponse.json(
      { success: false, error: { code: "CREATE_ERROR", message: "Failed to create delivery job" } },
      { status: 500 }
    );
  }
}
