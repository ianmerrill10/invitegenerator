"use client";

/**
 * Product Recommendations Component
 *
 * Displays personalized product suggestions based on invitation data.
 * Integrates with affiliate partners and Shopify stores.
 *
 * MONETIZATION:
 * - Affiliate links with tracking
 * - Direct Shopify store links
 * - Quantity suggestions based on guest count
 */

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Package,
  Sparkles,
  Users,
  Tag
} from "lucide-react";
import Link from "next/link";

interface ProductRecommendationsProps {
  eventType: string;
  guestCount?: number;
  eventDate?: string;
  invitationId?: string;
  compact?: boolean;
}

interface Recommendation {
  category: string;
  products: {
    name: string;
    slug: string;
    recommendedQuantity: number;
    affiliateLinks: {
      partner: string;
      partnerId: string;
      url: string;
    }[];
    shopifyLink: string | null;
  }[];
}

interface RecommendationData {
  eventType: string;
  guestCount: number;
  store: {
    name: string;
    url: string;
  } | null;
  recommendations: Recommendation[];
  featured: {
    name: string;
    description: string;
    discount?: string;
  }[];
}

export function ProductRecommendations({
  eventType,
  guestCount = 20,
  eventDate,
  invitationId,
  compact = false,
}: ProductRecommendationsProps) {
  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [eventType, guestCount]);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType, guestCount, eventDate }),
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
        if (result.data.recommendations.length > 0) {
          setActiveCategory(result.data.recommendations[0].category);
        }
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const trackClick = async (productSlug: string, partnerId: string) => {
    try {
      await fetch("/api/recommendations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          partnerId,
          eventType,
          invitationId,
        }),
      });
    } catch {
      // Silent fail
    }
  };

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-surface-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-surface-200 rounded w-full"></div>
          <div className="h-4 bg-surface-200 rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  if (compact) {
    return (
      <Card className="p-4 bg-gradient-to-br from-brand-50 to-accent-50 border-brand-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h4 className="font-semibold text-surface-900">Party Supplies</h4>
            <p className="text-sm text-surface-600">For your {eventType.replace("_", " ")}</p>
          </div>
        </div>
        <Link href={data.store?.url || "#"} target="_blank">
          <Button variant="primary" size="sm" className="w-full">
            Shop Now <ExternalLink className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </Card>
    );
  }

  const activeRecommendation = data.recommendations.find(
    (r) => r.category === activeCategory
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-surface-900">
            Recommended for Your Event
          </h2>
          <p className="text-surface-600 mt-1">
            Personalized suggestions for your {eventType.replace("_", " ")} with{" "}
            <span className="font-medium">{guestCount} guests</span>
          </p>
        </div>
        {data.store && (
          <Link href={data.store.url} target="_blank">
            <Button variant="outline" size="sm">
              Visit Store <ExternalLink className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        )}
      </div>

      {/* Featured Products */}
      {data.featured.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.featured.map((item, index) => (
            <Card
              key={index}
              className="p-4 bg-gradient-to-br from-brand-50 to-accent-50 border-brand-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-surface-900 truncate">
                      {item.name}
                    </h4>
                    {item.discount && (
                      <span className="px-2 py-0.5 bg-success-100 text-success-700 text-xs font-medium rounded-full">
                        {item.discount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-surface-600 mt-1">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {data.recommendations.map((category) => (
          <button
            key={category.category}
            onClick={() => setActiveCategory(category.category)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeCategory === category.category
                ? "bg-brand-100 text-brand-700"
                : "bg-surface-100 text-surface-600 hover:bg-surface-200"
            }`}
          >
            {category.category}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {activeRecommendation && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeRecommendation.products.map((product) => (
            <Card key={product.slug} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-surface-400" />
                  <h4 className="font-medium text-surface-900">{product.name}</h4>
                </div>
              </div>

              {/* Quantity Suggestion */}
              <div className="flex items-center gap-2 mb-4 text-sm text-surface-600">
                <Users className="h-4 w-4" />
                <span>
                  Suggested: <strong>{product.recommendedQuantity}</strong> for{" "}
                  {guestCount} guests
                </span>
              </div>

              {/* Shop Links */}
              <div className="space-y-2">
                {product.affiliateLinks.slice(0, 2).map((link) => (
                  <a
                    key={link.partnerId}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClick(product.slug, link.partnerId)}
                    className="flex items-center justify-between p-2 rounded-lg border border-surface-200 hover:border-brand-300 hover:bg-brand-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-surface-700">
                      {link.partner}
                    </span>
                    <ChevronRight className="h-4 w-4 text-surface-400" />
                  </a>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-surface-500 text-center">
        We may earn a commission when you shop through our links.{" "}
        <Link href="/privacy" className="text-brand-600 hover:underline">
          Learn more
        </Link>
      </p>
    </div>
  );
}
