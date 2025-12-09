import { NextRequest, NextResponse } from "next/server";
import {
  PRODIGI_PRODUCTS,
  PRODUCT_CATEGORIES,
  PRODUCT_BUNDLES,
  type ProductCategory,
} from "@/lib/prodigi/config";

// Force dynamic rendering (uses request.url)
export const dynamic = "force-dynamic";

// GET /api/prodigi/products - Get available products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as ProductCategory | null;
    const eventType = searchParams.get("eventType");

    // Get all products
    let products = Object.entries(PRODIGI_PRODUCTS).map(([productId, product]) => ({
      ...product,
      id: productId,
    }));

    // Filter by category if specified
    if (category && PRODUCT_CATEGORIES[category]) {
      products = products.filter((p) => p.category === category);
    }

    // Get recommended products for event type
    let recommended: string[] = [];
    if (eventType) {
      switch (eventType.toLowerCase()) {
        case "wedding":
          recommended = [
            "saveTheDate",
            "invitation",
            "rsvpCard",
            "program",
            "menuCard",
            "placeCard",
            "tableNumber",
            "thankYouCard",
          ];
          break;
        case "birthday":
          recommended = ["invitation", "thankYouCard"];
          break;
        case "baby-shower":
        case "babyshower":
          recommended = ["invitation", "thankYouCard"];
          break;
        case "corporate":
        case "business":
          recommended = ["invitation", "program", "placeCard", "tableNumber"];
          break;
        case "graduation":
          recommended = ["invitation", "program", "thankYouCard"];
          break;
        default:
          recommended = ["invitation", "thankYouCard"];
      }
    }

    // Sort products by category order
    const categoryOrder = Object.fromEntries(
      Object.entries(PRODUCT_CATEGORIES).map(([key, val]) => [key, val.order])
    );
    products.sort((a, b) => {
      const orderA = categoryOrder[a.category] || 99;
      const orderB = categoryOrder[b.category] || 99;
      return orderA - orderB;
    });

    // Group by category
    const grouped = products.reduce(
      (acc, product) => {
        const cat = product.category;
        if (!acc[cat]) {
          acc[cat] = {
            ...PRODUCT_CATEGORIES[cat as ProductCategory],
            products: [],
          };
        }
        acc[cat].products.push({
          ...product,
          isRecommended: recommended.includes(product.id),
        });
        return acc;
      },
      {} as Record<
        string,
        {
          name: string;
          description: string;
          order: number;
          products: Array<typeof products[0] & { isRecommended: boolean }>;
        }
      >
    );

    // Sort grouped categories by order
    const sortedGrouped = Object.entries(grouped)
      .sort(([, a], [, b]) => a.order - b.order)
      .reduce(
        (acc, [key, val]) => {
          acc[key] = val;
          return acc;
        },
        {} as typeof grouped
      );

    return NextResponse.json({
      success: true,
      data: {
        products: products.map((p) => ({
          ...p,
          isRecommended: recommended.includes(p.id),
        })),
        categories: sortedGrouped,
        bundles: eventType
          ? Object.entries(PRODUCT_BUNDLES)
              .filter(([key]) => {
                // Match bundle to event type
                const lowerEvent = eventType.toLowerCase();
                if (lowerEvent.includes("wedding") && key === "wedding") return true;
                if (lowerEvent.includes("birthday") && key === "birthday") return true;
                if (
                  (lowerEvent.includes("baby") || lowerEvent.includes("shower")) &&
                  key === "babyShower"
                )
                  return true;
                if (
                  (lowerEvent.includes("corporate") || lowerEvent.includes("business")) &&
                  key === "corporate"
                )
                  return true;
                return false;
              })
              .map(([id, bundle]) => ({ id, ...bundle }))
          : Object.entries(PRODUCT_BUNDLES).map(([id, bundle]) => ({
              id,
              ...bundle,
            })),
        recommended,
      },
    });
  } catch (error) {
    console.error("Products error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}
