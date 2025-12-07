/**
 * Templates API
 *
 * GET /api/templates - List all available templates
 * Supports filtering by category, style, and search
 */

import { NextRequest, NextResponse } from "next/server";

// Template data - in production this would come from DynamoDB
const TEMPLATES = [
  // Wedding Templates
  {
    id: "wedding-elegant-floral",
    name: "Elegant Floral",
    category: "wedding",
    style: "elegant",
    thumbnail: "/templates/wedding/elegant-floral.jpg",
    premium: false,
    colors: ["#D4AF37", "#1C1917", "#FAFAF9"],
    fonts: ["Playfair Display", "Source Serif Pro"],
    popularity: 95,
    createdAt: "2024-01-15",
  },
  {
    id: "wedding-modern-minimal",
    name: "Modern Minimal",
    category: "wedding",
    style: "minimalist",
    thumbnail: "/templates/wedding/modern-minimal.jpg",
    premium: false,
    colors: ["#18181B", "#71717A", "#FFFFFF"],
    fonts: ["Outfit", "Inter"],
    popularity: 88,
    createdAt: "2024-02-01",
  },
  {
    id: "wedding-rustic-charm",
    name: "Rustic Charm",
    category: "wedding",
    style: "rustic",
    thumbnail: "/templates/wedding/rustic-charm.jpg",
    premium: true,
    colors: ["#44403C", "#A8A29E", "#D6D3D1"],
    fonts: ["Cormorant Garamond", "Montserrat"],
    popularity: 82,
    createdAt: "2024-02-15",
  },
  {
    id: "wedding-garden-romance",
    name: "Garden Romance",
    category: "wedding",
    style: "romantic",
    thumbnail: "/templates/wedding/garden-romance.jpg",
    premium: true,
    colors: ["#14532D", "#22C55E", "#F0FDF4"],
    fonts: ["Playfair Display", "Nunito"],
    popularity: 79,
    createdAt: "2024-03-01",
  },

  // Birthday Templates
  {
    id: "birthday-confetti-blast",
    name: "Confetti Blast",
    category: "birthday",
    style: "playful",
    thumbnail: "/templates/birthday/confetti-blast.jpg",
    premium: false,
    colors: ["#FF6B47", "#14B8A6", "#FBBF24"],
    fonts: ["Fredoka One", "Nunito"],
    popularity: 92,
    createdAt: "2024-01-20",
  },
  {
    id: "birthday-neon-glow",
    name: "Neon Glow",
    category: "birthday",
    style: "bold",
    thumbnail: "/templates/birthday/neon-glow.jpg",
    premium: false,
    colors: ["#8B5CF6", "#EC4899", "#06B6D4"],
    fonts: ["Bebas Neue", "Open Sans"],
    popularity: 87,
    createdAt: "2024-02-10",
  },
  {
    id: "birthday-kids-fun",
    name: "Kids Fun Party",
    category: "birthday",
    style: "playful",
    thumbnail: "/templates/birthday/kids-fun.jpg",
    premium: false,
    colors: ["#EF4444", "#22C55E", "#3B82F6"],
    fonts: ["Fredoka One", "Nunito"],
    popularity: 90,
    createdAt: "2024-02-20",
  },
  {
    id: "birthday-elegant-adult",
    name: "Elegant Celebration",
    category: "birthday",
    style: "elegant",
    thumbnail: "/templates/birthday/elegant-adult.jpg",
    premium: true,
    colors: ["#D4AF37", "#1C1917", "#FAFAF9"],
    fonts: ["Playfair Display", "Inter"],
    popularity: 75,
    createdAt: "2024-03-05",
  },

  // Baby Shower Templates
  {
    id: "baby-shower-sweet-dreams",
    name: "Sweet Dreams",
    category: "baby_shower",
    style: "soft",
    thumbnail: "/templates/baby-shower/sweet-dreams.jpg",
    premium: false,
    colors: ["#FBCFE8", "#F0FDF4", "#FEF3C7"],
    fonts: ["DM Sans", "Nunito"],
    popularity: 89,
    createdAt: "2024-01-25",
  },
  {
    id: "baby-shower-woodland",
    name: "Woodland Friends",
    category: "baby_shower",
    style: "whimsical",
    thumbnail: "/templates/baby-shower/woodland.jpg",
    premium: true,
    colors: ["#14532D", "#A16207", "#FEF3C7"],
    fonts: ["Fredoka One", "DM Sans"],
    popularity: 84,
    createdAt: "2024-02-25",
  },
  {
    id: "baby-shower-modern-geo",
    name: "Modern Geometric",
    category: "baby_shower",
    style: "modern",
    thumbnail: "/templates/baby-shower/modern-geo.jpg",
    premium: false,
    colors: ["#0EA5E9", "#F97316", "#FAFAF9"],
    fonts: ["Outfit", "Inter"],
    popularity: 78,
    createdAt: "2024-03-10",
  },

  // Graduation Templates
  {
    id: "graduation-classic",
    name: "Classic Graduate",
    category: "graduation",
    style: "classic",
    thumbnail: "/templates/graduation/classic.jpg",
    premium: false,
    colors: ["#1E3A8A", "#D4AF37", "#FAFAF9"],
    fonts: ["Playfair Display", "Source Serif Pro"],
    popularity: 86,
    createdAt: "2024-02-01",
  },
  {
    id: "graduation-modern",
    name: "Modern Achievement",
    category: "graduation",
    style: "modern",
    thumbnail: "/templates/graduation/modern.jpg",
    premium: true,
    colors: ["#18181B", "#8B5CF6", "#FFFFFF"],
    fonts: ["Outfit", "Inter"],
    popularity: 81,
    createdAt: "2024-03-01",
  },

  // Corporate Templates
  {
    id: "corporate-professional",
    name: "Professional",
    category: "corporate",
    style: "classic",
    thumbnail: "/templates/corporate/professional.jpg",
    premium: false,
    colors: ["#1E3A8A", "#64748B", "#FFFFFF"],
    fonts: ["Inter", "Inter"],
    popularity: 83,
    createdAt: "2024-01-30",
  },
  {
    id: "corporate-modern",
    name: "Modern Business",
    category: "corporate",
    style: "modern",
    thumbnail: "/templates/corporate/modern.jpg",
    premium: true,
    colors: ["#18181B", "#0EA5E9", "#FFFFFF"],
    fonts: ["Outfit", "DM Sans"],
    popularity: 77,
    createdAt: "2024-02-28",
  },

  // Holiday Templates
  {
    id: "holiday-christmas",
    name: "Christmas Magic",
    category: "holiday",
    style: "festive",
    thumbnail: "/templates/holiday/christmas.jpg",
    premium: false,
    colors: ["#DC2626", "#15803D", "#D4AF37"],
    fonts: ["Playfair Display", "Nunito"],
    popularity: 94,
    createdAt: "2024-01-10",
  },
  {
    id: "holiday-halloween",
    name: "Spooky Night",
    category: "holiday",
    style: "playful",
    thumbnail: "/templates/holiday/halloween.jpg",
    premium: false,
    colors: ["#F97316", "#18181B", "#8B5CF6"],
    fonts: ["Fredoka One", "Open Sans"],
    popularity: 91,
    createdAt: "2024-01-12",
  },
  {
    id: "holiday-new-year",
    name: "New Year Sparkle",
    category: "holiday",
    style: "elegant",
    thumbnail: "/templates/holiday/new-year.jpg",
    premium: true,
    colors: ["#D4AF37", "#18181B", "#FAFAF9"],
    fonts: ["Bebas Neue", "Inter"],
    popularity: 88,
    createdAt: "2024-01-05",
  },

  // Dinner Party Templates
  {
    id: "dinner-elegant",
    name: "Elegant Dinner",
    category: "dinner_party",
    style: "elegant",
    thumbnail: "/templates/dinner/elegant.jpg",
    premium: true,
    colors: ["#7C2D12", "#D4AF37", "#FAFAF9"],
    fonts: ["Cormorant Garamond", "Montserrat"],
    popularity: 80,
    createdAt: "2024-02-05",
  },
  {
    id: "dinner-casual",
    name: "Casual Gathering",
    category: "dinner_party",
    style: "casual",
    thumbnail: "/templates/dinner/casual.jpg",
    premium: false,
    colors: ["#EA580C", "#14532D", "#FEF3C7"],
    fonts: ["DM Sans", "DM Sans"],
    popularity: 76,
    createdAt: "2024-02-18",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filter parameters
    const category = searchParams.get("category");
    const style = searchParams.get("style");
    const premium = searchParams.get("premium");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "popularity";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "12");

    let filteredTemplates = [...TEMPLATES];

    // Apply filters
    if (category) {
      filteredTemplates = filteredTemplates.filter(
        (t) => t.category === category
      );
    }

    if (style) {
      filteredTemplates = filteredTemplates.filter((t) => t.style === style);
    }

    if (premium !== null && premium !== undefined) {
      const isPremium = premium === "true";
      filteredTemplates = filteredTemplates.filter(
        (t) => t.premium === isPremium
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredTemplates = filteredTemplates.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.category.toLowerCase().includes(searchLower) ||
          t.style.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    switch (sort) {
      case "popularity":
        filteredTemplates.sort((a, b) => b.popularity - a.popularity);
        break;
      case "newest":
        filteredTemplates.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "name":
        filteredTemplates.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    // Pagination
    const totalCount = filteredTemplates.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedTemplates = filteredTemplates.slice(
      startIndex,
      startIndex + pageSize
    );

    // Get unique categories for filters
    const categories = [...new Set(TEMPLATES.map((t) => t.category))];
    const styles = [...new Set(TEMPLATES.map((t) => t.style))];

    return NextResponse.json({
      success: true,
      data: {
        templates: paginatedTemplates,
        filters: {
          categories,
          styles,
        },
      },
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Templates API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to fetch templates" },
      },
      { status: 500 }
    );
  }
}
