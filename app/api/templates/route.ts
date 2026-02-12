import { NextRequest, NextResponse } from "next/server";
import {
  templates,
  templateCategories,
  getTemplatesByCategory,
  getTemplateById,
  searchTemplates,
} from "@/lib/data/templates";
import type { EventType } from "@/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const category = searchParams.get("category") as EventType | null;
  const filter = searchParams.get("filter"); // "free" | "premium" | "popular" | "top-rated"
  const search = searchParams.get("search");
  const id = searchParams.get("id");
  const limit = searchParams.get("limit");

  try {
    // Get single template by ID
    if (id) {
      const template = getTemplateById(id);
      if (!template) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Template not found" } },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: { template } });
    }

    // Get templates based on filters
    let result = [...templates];

    // Apply category filter
    if (category) {
      result = getTemplatesByCategory(category);
    }

    // Apply special filters
    if (filter) {
      switch (filter) {
        case "free":
          result = result.filter((t) => !t.isPremium);
          break;
        case "premium":
          result = result.filter((t) => t.isPremium);
          break;
        case "popular":
          result = [...result].sort((a, b) => b.popularity - a.popularity);
          break;
        case "top-rated":
          result = [...result].sort((a, b) => b.rating - a.rating);
          break;
      }
    }

    // Apply search
    if (search) {
      const searchResults = searchTemplates(search);
      const searchIds = new Set(searchResults.map((t) => t.id));
      result = result.filter((t) => searchIds.has(t.id));
    }

    // Apply limit
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        result = result.slice(0, limitNum);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        templates: result,
        total: result.length,
        categories: templateCategories,
      },
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch templates" } },
      { status: 500 }
    );
  }
}
