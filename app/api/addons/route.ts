import { NextRequest, NextResponse } from "next/server";
import {
  ADDONS_PRICING,
  DIGITAL_DELIVERY_PRICING,
  EVENT_WEBSITE_PRICING,
} from "@/lib/pricing";
import { AddOnPurchase, AddOnType } from "@/types";
import { v4 as uuidv4 } from "uuid";

// GET /api/addons - Get all available add-ons with pricing
export async function GET() {
  try {
    const addons = {
      // AI Credits
      aiCredits: {
        name: "AI Generation Credits",
        description: "Generate more invitation designs with AI",
        packs: ADDONS_PRICING.aiCredits.packs,
        competitorNote: "Most competitors don't offer AI generation",
      },

      // Digital Delivery Credits
      deliveryCredits: {
        name: "Digital Delivery Credits",
        description: "Send invitations via premium email, SMS, or WhatsApp",
        packs: DIGITAL_DELIVERY_PRICING.creditPacks,
        competitorComparison: {
          us: "$0.04-0.08/credit",
          paperlessPost: "$0.18/guest",
          savings: "Up to 78%",
        },
      },

      // Design Services
      designServices: {
        name: "Professional Design Services",
        description: "Work with our designers",
        options: ADDONS_PRICING.designServices,
        competitorComparison: {
          us: "$49.99",
          minted: "$300+",
          savings: "83%",
        },
      },

      // Address Collection
      addressCollection: {
        name: "Guest Address Collection",
        description: ADDONS_PRICING.addressCollection.description,
        price: ADDONS_PRICING.addressCollection.price,
        features: ADDONS_PRICING.addressCollection.features,
        oneTime: true,
      },

      // Envelope Addressing
      envelopeAddressing: {
        name: "Printed Envelope Addressing",
        description: ADDONS_PRICING.envelopeAddressing.description,
        pricePerEnvelope: ADDONS_PRICING.envelopeAddressing.pricePerEnvelope,
        minimumOrder: ADDONS_PRICING.envelopeAddressing.minimumOrder,
        competitorComparison: {
          us: "$0.25/envelope",
          industry: "$0.50-1.00/envelope",
          savings: "50-75%",
        },
      },

      // Wax Seals
      waxSeals: {
        name: "Custom Wax Seals",
        description: ADDONS_PRICING.waxSeals.description,
        pricePerSeal: ADDONS_PRICING.waxSeals.pricePerSeal,
        setupFee: ADDONS_PRICING.waxSeals.setupFee,
        minimumOrder: ADDONS_PRICING.waxSeals.minimumOrder,
      },

      // Ribbons
      ribbons: {
        name: "Ribbon Belly Bands",
        description: ADDONS_PRICING.ribbons.description,
        pricePerBand: ADDONS_PRICING.ribbons.pricePerBand,
        minimumOrder: ADDONS_PRICING.ribbons.minimumOrder,
        colors: ADDONS_PRICING.ribbons.colors,
      },

      // Photo Enhancement
      photoEnhancement: {
        name: "AI Photo Enhancement",
        description: ADDONS_PRICING.photoEnhancement.description,
        pricePerPhoto: ADDONS_PRICING.photoEnhancement.pricePerPhoto,
        features: ADDONS_PRICING.photoEnhancement.features,
      },

      // Event Website Upgrade
      websiteUpgrade: {
        name: "Premium Event Website",
        description: "Upgrade to premium website features",
        tiers: {
          premium: {
            price: EVENT_WEBSITE_PRICING.premium.priceYearly,
            features: EVENT_WEBSITE_PRICING.premium.features,
          },
          pro: {
            price: EVENT_WEBSITE_PRICING.pro.priceYearly,
            features: EVENT_WEBSITE_PRICING.pro.features,
          },
        },
        competitorComparison: {
          us: "$9.99-29.99/year",
          zola: "$14.95/year",
          theKnot: "$19.99/year",
          savings: "Up to 50%",
        },
      },
    };

    return NextResponse.json({
      success: true,
      data: { addons },
    });
  } catch (error) {
    console.error("Error fetching addons:", error);
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: "Failed to fetch add-ons" } },
      { status: 500 }
    );
  }
}

// POST /api/addons - Purchase an add-on
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, quantity = 1, metadata } = body;

    if (!userId || !type) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "userId and type required" } },
        { status: 400 }
      );
    }

    // Calculate price based on add-on type
    let price = 0;
    let description = "";

    switch (type as AddOnType) {
      case "aiCredits": {
        const pack = ADDONS_PRICING.aiCredits.packs.find(p => p.credits === quantity);
        if (!pack) {
          return NextResponse.json(
            { success: false, error: { code: "INVALID_QUANTITY", message: "Invalid credit pack quantity" } },
            { status: 400 }
          );
        }
        price = pack.price;
        description = `${quantity} AI Credits`;
        break;
      }

      case "deliveryCredits": {
        const pack = DIGITAL_DELIVERY_PRICING.creditPacks.find(p => p.credits === quantity);
        if (!pack) {
          return NextResponse.json(
            { success: false, error: { code: "INVALID_QUANTITY", message: "Invalid credit pack quantity" } },
            { status: 400 }
          );
        }
        price = pack.price;
        description = `${quantity} Delivery Credits`;
        break;
      }

      case "customDesign":
        price = ADDONS_PRICING.designServices.customDesign.price;
        description = "Custom Design Service";
        break;

      case "designReview":
        price = ADDONS_PRICING.designServices.designReview.price;
        description = "Design Review Service";
        break;

      case "addressCollection":
        price = ADDONS_PRICING.addressCollection.price;
        description = "Address Collection Form";
        break;

      case "envelopeAddressing":
        if (quantity < ADDONS_PRICING.envelopeAddressing.minimumOrder) {
          return NextResponse.json(
            { success: false, error: { code: "MINIMUM_ORDER", message: `Minimum order is ${ADDONS_PRICING.envelopeAddressing.minimumOrder} envelopes` } },
            { status: 400 }
          );
        }
        price = quantity * ADDONS_PRICING.envelopeAddressing.pricePerEnvelope;
        description = `Envelope Addressing (${quantity} envelopes)`;
        break;

      case "waxSeals":
        if (quantity < ADDONS_PRICING.waxSeals.minimumOrder) {
          return NextResponse.json(
            { success: false, error: { code: "MINIMUM_ORDER", message: `Minimum order is ${ADDONS_PRICING.waxSeals.minimumOrder} seals` } },
            { status: 400 }
          );
        }
        const isFirstOrder = metadata?.firstOrder !== false;
        price = (quantity * ADDONS_PRICING.waxSeals.pricePerSeal) + (isFirstOrder ? ADDONS_PRICING.waxSeals.setupFee : 0);
        description = `Wax Seals (${quantity})${isFirstOrder ? " + Setup" : ""}`;
        break;

      case "ribbons":
        if (quantity < ADDONS_PRICING.ribbons.minimumOrder) {
          return NextResponse.json(
            { success: false, error: { code: "MINIMUM_ORDER", message: `Minimum order is ${ADDONS_PRICING.ribbons.minimumOrder} ribbons` } },
            { status: 400 }
          );
        }
        price = quantity * ADDONS_PRICING.ribbons.pricePerBand;
        description = `Ribbon Belly Bands (${quantity})`;
        break;

      case "photoEnhancement":
        price = quantity * ADDONS_PRICING.photoEnhancement.pricePerPhoto;
        description = `Photo Enhancement (${quantity} photos)`;
        break;

      default:
        return NextResponse.json(
          { success: false, error: { code: "INVALID_TYPE", message: "Invalid add-on type" } },
          { status: 400 }
        );
    }

    const purchase: AddOnPurchase = {
      id: uuidv4(),
      userId,
      type: type as AddOnType,
      quantity,
      price,
      status: "pending",
      metadata,
      createdAt: new Date().toISOString(),
    };

    // TODO: Create Stripe checkout session for payment
    // TODO: Save purchase to database

    return NextResponse.json({
      success: true,
      data: {
        purchase,
        description,
        // In production, return Stripe checkout URL
        checkoutUrl: `/checkout?purchaseId=${purchase.id}`,
      },
    });
  } catch (error) {
    console.error("Error creating add-on purchase:", error);
    return NextResponse.json(
      { success: false, error: { code: "PURCHASE_ERROR", message: "Failed to create purchase" } },
      { status: 500 }
    );
  }
}
