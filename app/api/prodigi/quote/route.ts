import { NextRequest, NextResponse } from "next/server";
import { ProdigiClient, type ProdigiQuoteRequest } from "@/lib/prodigi/client";
import { PRODIGI_PRODUCTS, PRODIGI_CONFIG, type ProductId } from "@/lib/prodigi/config";

// POST /api/prodigi/quote - Get a quote for products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products, countryCode, currency, shippingMethod } = body as {
      products: Array<{ productId: ProductId; quantity: number }>;
      countryCode: string;
      currency?: string;
      shippingMethod?: "Budget" | "Standard" | "Express" | "Overnight";
    };

    // Validate required fields
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "Products array is required" },
        { status: 400 }
      );
    }

    if (!countryCode) {
      return NextResponse.json(
        { error: "Country code is required" },
        { status: 400 }
      );
    }

    // Build quote request items
    const quoteItems = products.map((item) => {
      const product = PRODIGI_PRODUCTS[item.productId];
      if (!product) {
        throw new Error(`Unknown product: ${item.productId}`);
      }
      return {
        sku: product.sku,
        copies: item.quantity,
        assets: [{ printArea: "default" }],
      };
    });

    // Create client (uses sandbox by default unless PRODIGI_ENVIRONMENT=live)
    const useSandbox = process.env.PRODIGI_ENVIRONMENT !== "live";
    const client = new ProdigiClient(undefined, useSandbox);

    // Get quote from Prodigi
    const quoteRequest: ProdigiQuoteRequest = {
      destinationCountryCode: countryCode,
      currencyCode: currency || PRODIGI_CONFIG.defaultCurrency,
      items: quoteItems,
      ...(shippingMethod && { shippingMethod }),
    };

    const response = await client.getQuote(quoteRequest);

    // Calculate retail prices with markup
    const quotesWithMarkup = response.quotes.map((quote) => {
      const itemsWithRetail = quote.items.map((item) => {
        // Find the product config for markup
        const productEntry = Object.entries(PRODIGI_PRODUCTS).find(
          ([_, p]) => p.sku === item.sku
        );
        const markup = productEntry ? productEntry[1].suggestedMarkup : 2.0;

        const unitCost = parseFloat(item.unitCost.amount);
        const retailPrice = (unitCost * markup).toFixed(2);

        return {
          ...item,
          unitCost: item.unitCost,
          retailPrice: {
            amount: retailPrice,
            currency: item.unitCost.currency,
          },
          markup,
        };
      });

      // Calculate total retail
      const itemsTotal = itemsWithRetail.reduce(
        (sum, item) => sum + parseFloat(item.retailPrice.amount) * item.copies,
        0
      );
      const shippingCost = parseFloat(quote.costSummary.shipping.amount);
      const totalRetail = (itemsTotal + shippingCost).toFixed(2);

      return {
        ...quote,
        items: itemsWithRetail,
        retailSummary: {
          items: {
            amount: itemsTotal.toFixed(2),
            currency: quote.costSummary.items.currency,
          },
          shipping: quote.costSummary.shipping,
          total: {
            amount: totalRetail,
            currency: quote.costSummary.items.currency,
          },
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        quotes: quotesWithMarkup,
        issues: response.issues || [],
      },
    });
  } catch (error) {
    console.error("Quote error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to get quote",
      },
      { status: 500 }
    );
  }
}
