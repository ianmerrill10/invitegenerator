/**
 * Admin API: Generate Templates
 *
 * POST /api/admin/generate-templates - Start template generation
 * GET /api/admin/generate-templates - Get generation plan/estimate
 *
 * Protected by ADMIN_API_KEY
 */

import { NextRequest, NextResponse } from "next/server";
import {
  generateAllTemplates,
  generateCategoryTemplates,
  generateGradientTemplates,
  getGenerationPlan,
  type GenerationConfig,
  type BatchGenerationProgress,
} from "@/lib/ai/template-orchestrator";
import { TEMPLATE_CATEGORIES } from "@/lib/template-generator";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// In-memory progress tracking (use Redis in production)
let currentProgress: BatchGenerationProgress | null = null;
let isGenerating = false;

/**
 * Verify admin API key
 */
function verifyAdminKey(request: NextRequest): boolean {
  const apiKey = request.headers.get("x-admin-key") || request.headers.get("authorization")?.replace("Bearer ", "");
  const validKey = process.env.ADMIN_API_KEY;

  if (!validKey) {
    console.warn("ADMIN_API_KEY not configured");
    return false;
  }

  return apiKey === validKey;
}

/**
 * GET - Get generation plan and cost estimate
 */
export async function GET(request: NextRequest) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  // Return current progress if requested
  if (action === "progress") {
    return NextResponse.json({
      isGenerating,
      progress: currentProgress,
    });
  }

  // Return available categories
  if (action === "categories") {
    const categories = Object.entries(TEMPLATE_CATEGORIES).map(([key, value]) => ({
      id: key,
      name: value.name,
      subcategories: value.subcategories,
      targetCount: value.targetCount,
    }));

    return NextResponse.json({ categories });
  }

  // Get generation plan
  const categories = searchParams.get("categories")?.split(",");
  const stylesPerCategory = parseInt(searchParams.get("styles") || "5");

  const plan = getGenerationPlan({
    categories,
    stylesPerCategory,
  });

  return NextResponse.json({
    plan,
    note: "Use POST to start generation. Set useAIBackgrounds=false for faster, cheaper generation.",
  });
}

/**
 * POST - Start template generation
 */
export async function POST(request: NextRequest) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if already generating
  if (isGenerating) {
    return NextResponse.json(
      {
        error: "Generation already in progress",
        progress: currentProgress,
      },
      { status: 409 }
    );
  }

  try {
    const body = await request.json();
    const {
      categories,
      stylesPerCategory = 5,
      useAIBackgrounds = false, // Default to gradient backgrounds (cheaper/faster)
      batchSize = 5,
      category, // Single category mode
    } = body as {
      categories?: string[];
      stylesPerCategory?: number;
      useAIBackgrounds?: boolean;
      batchSize?: number;
      category?: string;
    };

    // Validate OpenAI key if using AI backgrounds
    if (useAIBackgrounds && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY required for AI backgrounds" },
        { status: 400 }
      );
    }

    // Validate S3 configuration
    if (!process.env.S3_BUCKET_NAME) {
      return NextResponse.json(
        { error: "S3_BUCKET_NAME required for template storage" },
        { status: 400 }
      );
    }

    const config: GenerationConfig = {
      categories,
      stylesPerCategory,
      useAIBackgrounds,
      batchSize,
    };

    // Get plan for response
    const plan = getGenerationPlan(config);

    // Start generation (non-blocking)
    isGenerating = true;
    currentProgress = {
      total: plan.totalTemplates,
      completed: 0,
      failed: 0,
      currentCategory: "",
      currentSubcategory: "",
      results: [],
    };

    // Run generation in background
    const runGeneration = async () => {
      try {
        let results;

        if (category) {
          // Single category mode
          results = await generateCategoryTemplates(
            category,
            config,
            (progress) => {
              currentProgress = progress;
            }
          );
        } else if (useAIBackgrounds) {
          results = await generateAllTemplates(config, (progress) => {
            currentProgress = progress;
          });
        } else {
          results = await generateGradientTemplates(config, (progress) => {
            currentProgress = progress;
          });
        }

        console.log(`Generation complete: ${results.filter(r => r.success).length} successful, ${results.filter(r => !r.success).length} failed`);
      } catch (error) {
        console.error("Generation failed:", error);
      } finally {
        isGenerating = false;
      }
    };

    // Don't await - run in background
    runGeneration();

    return NextResponse.json({
      success: true,
      message: "Template generation started",
      plan,
      config: {
        categories: config.categories || "all",
        stylesPerCategory,
        useAIBackgrounds,
        batchSize,
      },
      checkProgressUrl: "/api/admin/generate-templates?action=progress",
    });
  } catch (error) {
    console.error("Generation error:", error);
    isGenerating = false;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
