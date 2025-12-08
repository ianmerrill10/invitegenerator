import { NextRequest, NextResponse } from "next/server";
import {
  STATIONERY_BUNDLE_PRICING,
  RUSH_PROCESSING,
  TIER_INCLUSIONS,
  calculateBundlePrice,
  getRushProcessingFee,
} from "@/lib/pricing";
import { PRODIGI_PRODUCTS } from "@/lib/prodigi/config";
import { UserPlan } from "@/types";

// GET /api/bundles - Get all available bundles with pricing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quantity = parseInt(searchParams.get("quantity") || "100", 10);
    const userPlan = (searchParams.get("plan") || "free") as UserPlan;

    // Build bundle response with calculated pricing
    const bundles = Object.entries(STATIONERY_BUNDLE_PRICING)
      .filter(([key]) => key !== "quantityDiscounts")
      .map(([id, bundle]) => {
        if (typeof bundle !== "object" || !("pricePerSet" in bundle)) return null;

        const pricing = calculateBundlePrice(id as keyof typeof STATIONERY_BUNDLE_PRICING, quantity);
        const tierDiscount = TIER_INCLUSIONS[userPlan].bundleDiscount;
        const tierDiscountAmount = pricing.total * tierDiscount;
        const finalTotal = pricing.total - tierDiscountAmount;

        // Get product details for each item in bundle
        const products = bundle.products.map((productId: string) => {
          const product = PRODIGI_PRODUCTS[productId as keyof typeof PRODIGI_PRODUCTS];
          return {
            id: productId,
            name: product?.name || productId,
            description: product?.description || "",
            includesEnvelope: product?.includesEnvelope || false,
          };
        });

        return {
          id,
          name: bundle.name,
          description: bundle.description,
          products,
          popular: bundle.popular,
          savings: bundle.savings,
          pricing: {
            quantity,
            pricePerSet: bundle.pricePerSet,
            subtotal: pricing.subtotal,
            quantityDiscount: pricing.discount,
            tierDiscount: tierDiscountAmount,
            total: finalTotal,
            finalPerSet: finalTotal / quantity,
          },
        };
      })
      .filter(Boolean);

    // Include quantity discounts info
    const quantityDiscounts = STATIONERY_BUNDLE_PRICING.quantityDiscounts;

    // Include rush processing options with user's tier discount
    const rushOptions = Object.entries(RUSH_PROCESSING).map(([id, option]) => ({
      id,
      name: option.name,
      description: option.description,
      fee: getRushProcessingFee(id as keyof typeof RUSH_PROCESSING, userPlan),
      originalFee: option.fee,
      processingDays: option.processingDays,
    }));

    return NextResponse.json({
      success: true,
      data: {
        bundles,
        quantityDiscounts,
        rushOptions,
        userPlan,
        tierBenefits: {
          bundleDiscount: `${TIER_INCLUSIONS[userPlan].bundleDiscount * 100}%`,
          rushDiscount: `${TIER_INCLUSIONS[userPlan].rushProcessingDiscount * 100}%`,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: "Failed to fetch bundles" } },
      { status: 500 }
    );
  }
}

// POST /api/bundles/quote - Get detailed quote for a bundle order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bundleId,
      quantity,
      userPlan = "free",
      rushType = "standard",
      shippingCountry = "US",
    } = body;

    if (!bundleId || !quantity) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "bundleId and quantity required" } },
        { status: 400 }
      );
    }

    const bundle = STATIONERY_BUNDLE_PRICING[bundleId as keyof typeof STATIONERY_BUNDLE_PRICING];
    if (!bundle || typeof bundle !== "object" || !("pricePerSet" in bundle)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_BUNDLE", message: "Invalid bundle ID" } },
        { status: 400 }
      );
    }

    // Calculate pricing
    const basePricing = calculateBundlePrice(bundleId as keyof typeof STATIONERY_BUNDLE_PRICING, quantity);
    const tierDiscount = TIER_INCLUSIONS[userPlan as UserPlan].bundleDiscount;
    const tierDiscountAmount = basePricing.total * tierDiscount;
    const afterTierDiscount = basePricing.total - tierDiscountAmount;

    // Rush processing fee
    const rushFee = getRushProcessingFee(rushType as keyof typeof RUSH_PROCESSING, userPlan as UserPlan);

    // Estimate shipping (simplified - in production, call Prodigi API)
    const shippingEstimates: Record<string, number> = {
      US: quantity * 0.15,
      CA: quantity * 0.25,
      GB: quantity * 0.20,
      AU: quantity * 0.35,
      DEFAULT: quantity * 0.30,
    };
    const shippingCost = shippingEstimates[shippingCountry] || shippingEstimates.DEFAULT;

    // Tax estimation (simplified)
    const taxRate = shippingCountry === "US" ? 0.08 : 0;
    const taxableAmount = afterTierDiscount + rushFee;
    const tax = taxableAmount * taxRate;

    const total = afterTierDiscount + rushFee + shippingCost + tax;

    return NextResponse.json({
      success: true,
      data: {
        quote: {
          bundleId,
          bundleName: bundle.name,
          quantity,
          breakdown: {
            subtotal: basePricing.subtotal,
            quantityDiscount: basePricing.discount,
            tierDiscount: tierDiscountAmount,
            afterDiscounts: afterTierDiscount,
            rushProcessing: {
              type: rushType,
              fee: rushFee,
            },
            shipping: shippingCost,
            tax,
            total,
          },
          perSetCost: total / quantity,
          savings: {
            vsCompetitor: ((7.5 * quantity) - total).toFixed(2), // vs Minted avg $7.50/set
            percentage: (((7.5 * quantity) - total) / (7.5 * quantity) * 100).toFixed(0) + "%",
          },
        },
        estimatedDelivery: {
          processing: RUSH_PROCESSING[rushType as keyof typeof RUSH_PROCESSING]?.processingDays || 5,
          shipping: "5-7 business days",
          total: "7-12 business days",
        },
      },
    });
  } catch (error) {
    console.error("Error calculating bundle quote:", error);
    return NextResponse.json(
      { success: false, error: { code: "QUOTE_ERROR", message: "Failed to calculate quote" } },
      { status: 500 }
    );
  }
}
