import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import {
  prodigiService,
  getSKUForSize,
  getPricePerUnit,
  estimateShipping,
  PRODIGI_SHIPPING,
  PRODIGI_FINISHES,
} from "@/lib/services/prodigi-service";

interface QuoteRequest {
  invitationId: string;
  size: string;
  quantity: number;
  cardType: "flat" | "folded" | "postcard" | "premium";
  finish: string;
  shippingCountry: string;
  shippingMethod: string;
}

// POST /api/print/quote - Get a quote for printing
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body: QuoteRequest = await request.json();
    const { size, quantity, cardType, finish, shippingCountry, shippingMethod } = body;

    // Validate request
    if (!size || !quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "Invalid request parameters" } },
        { status: 400 }
      );
    }

    // Get SKU for the selected product
    const sku = getSKUForSize(size, cardType);

    // Calculate pricing
    const productKey = `${cardType}-${size}` as "flat-4x6" | "flat-5x7" | "folded-5x7" | "premium-5x7";
    const unitPrice = getPricePerUnit(productKey, quantity);
    const subtotal = unitPrice * quantity;
    const shipping = estimateShipping(shippingCountry, shippingMethod as "standard" | "express");
    const total = subtotal + shipping;

    // Try to get actual Prodigi quote if API key is configured
    let prodigiQuote = null;
    if (process.env.PRODIGI_API_KEY) {
      try {
        prodigiQuote = await prodigiService.getQuote({
          shippingMethod: PRODIGI_SHIPPING[shippingMethod.toUpperCase() as keyof typeof PRODIGI_SHIPPING] || PRODIGI_SHIPPING.STANDARD,
          destinationCountryCode: shippingCountry,
          currencyCode: "USD",
          items: [
            {
              sku,
              copies: quantity,
              attributes: {
                finish: PRODIGI_FINISHES[finish.toUpperCase() as keyof typeof PRODIGI_FINISHES] || PRODIGI_FINISHES.MATTE,
              },
            },
          ],
        });
      } catch (error) {
        console.warn("Prodigi quote unavailable, using estimates:", error);
      }
    }

    // Build quote response
    const quote = {
      sku,
      quantity,
      unitPrice,
      subtotal,
      shipping,
      total,
      currency: "USD",
      estimatedDelivery: getEstimatedDelivery(shippingMethod, shippingCountry),
      breakdown: {
        printing: subtotal,
        shipping,
        tax: 0, // Tax calculated at checkout based on location
      },
      prodigiQuote: prodigiQuote ? {
        available: true,
        wholesale: prodigiQuote.quotes?.[0]?.costSummary?.total?.cost,
      } : {
        available: false,
      },
    };

    return NextResponse.json({ success: true, data: quote });
  } catch (error) {
    console.error("Quote error:", error);
    return NextResponse.json(
      { success: false, error: { code: "QUOTE_FAILED", message: "Failed to generate quote" } },
      { status: 500 }
    );
  }
}

function getEstimatedDelivery(method: string, country: string): string {
  const days: Record<string, Record<string, string>> = {
    standard: {
      US: "5-7 business days",
      CA: "7-10 business days",
      GB: "3-5 business days",
      EU: "5-8 business days",
      AU: "10-14 business days",
      default: "10-21 business days",
    },
    express: {
      US: "2-3 business days",
      CA: "3-5 business days",
      GB: "1-2 business days",
      EU: "2-4 business days",
      AU: "5-7 business days",
      default: "5-10 business days",
    },
    overnight: {
      US: "Next business day",
      default: "Not available",
    },
  };

  const methodDays = days[method.toLowerCase()] || days.standard;
  return methodDays[country] || methodDays.default;
}
