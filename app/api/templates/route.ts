/**
 * Templates API - 1000+ Templates Library
 *
 * GET /api/templates - List all available templates
 * Supports filtering by category, subcategory, style, and search
 *
 * CATEGORIES: 17 event types
 * TEMPLATES: 1000+ unique designs
 * STYLES: 20 design styles
 */

import { NextRequest, NextResponse } from "next/server";
import {
  generateAllTemplates,
  getTemplateStats,
  TEMPLATE_CATEGORIES,
  DESIGN_STYLES,
  type GeneratedTemplate,
} from "@/lib/template-generator";

// Generate the full template library on module load (1000+ templates)
const TEMPLATES = generateAllTemplates();

// Cache stats
const STATS = getTemplateStats(TEMPLATES);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query parameters
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const style = searchParams.get("style");
    const search = searchParams.get("search");
    const premium = searchParams.get("premium");
    const tags = searchParams.get("tags");
    const sort = searchParams.get("sort") || "popularity";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "24"), 100);

    // Start with all templates
    let filtered = [...TEMPLATES];

    // Apply filters
    if (category) {
      filtered = filtered.filter((t) => t.category === category);
    }

    if (subcategory) {
      filtered = filtered.filter((t) => t.subcategory === subcategory);
    }

    if (style) {
      filtered = filtered.filter((t) => t.style === style);
    }

    if (premium !== null && premium !== undefined) {
      const isPremium = premium === "true";
      filtered = filtered.filter((t) => t.premium === isPremium);
    }

    if (tags) {
      const tagList = tags.split(",").map((t) => t.trim().toLowerCase());
      filtered = filtered.filter((t) =>
        tagList.some((tag) => t.tags.some((templateTag) => templateTag.toLowerCase().includes(tag)))
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower) ||
          t.category.toLowerCase().includes(searchLower) ||
          t.subcategory.toLowerCase().includes(searchLower) ||
          t.style.toLowerCase().includes(searchLower) ||
          t.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort templates
    switch (sort) {
      case "popularity":
        filtered.sort((a, b) => b.popularity - a.popularity);
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "random":
        filtered.sort(() => Math.random() - 0.5);
        break;
    }

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    // Get category metadata
    const categoryMeta = category
      ? TEMPLATE_CATEGORIES[category as keyof typeof TEMPLATE_CATEGORIES]
      : null;

    return NextResponse.json({
      templates: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        category,
        subcategory,
        style,
        search,
        premium,
        tags,
        sort,
      },
      meta: {
        totalTemplates: STATS.total,
        premiumCount: STATS.premium,
        freeCount: STATS.free,
        categories: Object.keys(TEMPLATE_CATEGORIES).length,
        styles: DESIGN_STYLES.length,
        ...(categoryMeta && {
          categoryInfo: {
            name: categoryMeta.name,
            subcategories: categoryMeta.subcategories,
            templateCount: STATS.byCategory[category!] || 0,
          },
        }),
      },
    });
  } catch (error) {
    console.error("Templates API error:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

/**
 * Get template categories and metadata
 */
export async function OPTIONS() {
  const categories = Object.entries(TEMPLATE_CATEGORIES).map(([key, value]) => ({
    id: key,
    name: value.name,
    subcategories: value.subcategories,
    templateCount: STATS.byCategory[key] || 0,
  }));

  const styles = DESIGN_STYLES.map((style) => ({
    id: style,
    name: style.charAt(0).toUpperCase() + style.slice(1).replace(/-/g, " "),
    templateCount: STATS.byStyle[style] || 0,
  }));

  return NextResponse.json({
    categories,
    styles,
    stats: STATS,
  });
}
