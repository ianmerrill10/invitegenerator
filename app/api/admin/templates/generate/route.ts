/**
 * AI Template Generation Agent API
 *
 * POST /api/admin/templates/generate - Generate templates using AI
 *
 * This endpoint uses Claude/Bedrock to create unique, creative templates
 * at scale. Target: 1000+ templates within 30 days.
 */

import { NextRequest, NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import {
  TEMPLATE_CATEGORIES,
  DESIGN_STYLES,
  COLOR_PALETTES,
  FONT_PAIRINGS,
  generateAllTemplates,
  getTemplateStats,
  type GeneratedTemplate,
} from "@/lib/template-generator";

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TEMPLATES_TABLE = process.env.DYNAMODB_TEMPLATES_TABLE || "InviteGenerator-Templates";

/**
 * Use Claude to generate creative template names and descriptions
 */
async function generateCreativeContent(
  category: string,
  subcategory: string,
  style: string,
  count: number
): Promise<Array<{ name: string; description: string; tagline: string }>> {
  const prompt = `You are a creative designer generating invitation template names and descriptions.

Generate ${count} unique, creative template names and descriptions for:
- Category: ${category}
- Subcategory: ${subcategory}
- Style: ${style}

For each template provide:
1. name: A creative, memorable 2-4 word name (e.g., "Midnight Garden", "Golden Hour Dreams")
2. description: A compelling 1-2 sentence description highlighting the design
3. tagline: A short catchy phrase for marketing (5-8 words)

Return as a JSON array. Example:
[
  {
    "name": "Enchanted Garden",
    "description": "A romantic floral design with delicate watercolor blooms and elegant script typography.",
    "tagline": "Where love blooms in every detail"
  }
]

Generate exactly ${count} unique templates. Be creative and avoid generic names.`;

  try {
    const response = await bedrockClient.send(
      new InvokeModelCommand({
        modelId: "anthropic.claude-3-haiku-20240307-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      })
    );

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const content = responseBody.content[0].text;

    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error("AI generation failed, using fallback:", error);
  }

  // Fallback to programmatic generation
  return Array.from({ length: count }, (_, i) => ({
    name: `${style.charAt(0).toUpperCase() + style.slice(1)} ${subcategory.replace(/-/g, " ")} ${i + 1}`,
    description: `Beautiful ${style} invitation template for ${subcategory.replace(/-/g, " ")} events.`,
    tagline: `Perfect for your special ${category} celebration`,
  }));
}

/**
 * Generate AI-enhanced templates for a category
 */
async function generateAITemplatesForCategory(
  categoryKey: string,
  targetCount: number
): Promise<GeneratedTemplate[]> {
  const category = TEMPLATE_CATEGORIES[categoryKey as keyof typeof TEMPLATE_CATEGORIES];
  if (!category) return [];

  const templates: GeneratedTemplate[] = [];
  const subcategories = category.subcategories;
  const templatesPerSubcategory = Math.ceil(targetCount / subcategories.length);

  for (const subcategory of subcategories) {
    // Generate templates for each style
    for (let styleIndex = 0; styleIndex < DESIGN_STYLES.length && templates.length < targetCount; styleIndex++) {
      const style = DESIGN_STYLES[styleIndex];
      const batchSize = Math.min(5, templatesPerSubcategory - (styleIndex * 5));

      if (batchSize <= 0) break;

      // Get creative content from AI
      const creativeContent = await generateCreativeContent(
        categoryKey,
        subcategory,
        style,
        batchSize
      );

      for (let i = 0; i < creativeContent.length && templates.length < targetCount; i++) {
        const content = creativeContent[i];
        const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
        const fonts = FONT_PAIRINGS[Math.floor(Math.random() * FONT_PAIRINGS.length)];

        const template: GeneratedTemplate = {
          id: `${categoryKey}-${subcategory}-${style}-${Date.now()}-${i}`,
          name: content.name,
          category: categoryKey,
          subcategory,
          style,
          thumbnail: `/templates/${categoryKey}/${subcategory}-${style}-${i}.jpg`,
          premium: Math.random() > 0.7,
          colors: palette.colors,
          fonts: [fonts.heading, fonts.body],
          popularity: Math.floor(Math.random() * 40) + 60,
          createdAt: new Date().toISOString().split("T")[0],
          description: content.description,
          tags: [categoryKey, subcategory, style, "invitation", content.tagline.toLowerCase()],
          layout: {
            headerPosition: ["top", "center", "bottom"][Math.floor(Math.random() * 3)] as "top" | "center" | "bottom",
            imagePosition: ["background", "left", "right", "top", "none"][Math.floor(Math.random() * 5)] as "background" | "left" | "right" | "top" | "none",
            textAlignment: ["left", "center", "right"][Math.floor(Math.random() * 3)] as "left" | "center" | "right",
            decorations: [],
            spacing: ["compact", "balanced", "spacious"][Math.floor(Math.random() * 3)] as "compact" | "balanced" | "spacious",
          },
        };

        templates.push(template);
      }
    }
  }

  return templates;
}

/**
 * Save templates to DynamoDB in batches
 */
async function saveTemplatesToDB(templates: GeneratedTemplate[]): Promise<number> {
  let savedCount = 0;
  const batchSize = 25; // DynamoDB batch write limit

  for (let i = 0; i < templates.length; i += batchSize) {
    const batch = templates.slice(i, i + batchSize);

    const writeRequests = batch.map((template) => ({
      PutRequest: {
        Item: {
          PK: `TEMPLATE#${template.id}`,
          SK: `CATEGORY#${template.category}`,
          ...template,
          GSI1PK: `CATEGORY#${template.category}`,
          GSI1SK: `STYLE#${template.style}`,
          GSI2PK: `STYLE#${template.style}`,
          GSI2SK: `POPULARITY#${template.popularity.toString().padStart(3, "0")}`,
        },
      },
    }));

    try {
      await docClient.send(
        new BatchWriteCommand({
          RequestItems: {
            [TEMPLATES_TABLE]: writeRequests,
          },
        })
      );
      savedCount += batch.length;
    } catch (error) {
      console.error("Failed to save batch:", error);
    }
  }

  return savedCount;
}

/**
 * POST - Generate templates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      mode = "quick", // quick (programmatic), ai (AI-enhanced), full (all categories with AI)
      category,
      count = 100,
      saveToDb = false,
    } = body;

    // Validate admin access - always require authentication
    const adminKey = request.headers.get("x-admin-key");
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let templates: GeneratedTemplate[] = [];
    let stats;

    if (mode === "quick") {
      // Fast programmatic generation
      if (category) {
        const { generateTemplatesForCategory } = await import("@/lib/template-generator");
        templates = generateTemplatesForCategory(category, count);
      } else {
        templates = generateAllTemplates();
      }
      stats = getTemplateStats(templates);
    } else if (mode === "ai") {
      // AI-enhanced generation for specific category
      if (!category) {
        return NextResponse.json(
          { error: "Category required for AI mode" },
          { status: 400 }
        );
      }
      templates = await generateAITemplatesForCategory(category, count);
      stats = getTemplateStats(templates);
    } else if (mode === "full") {
      // Generate all templates with AI enhancement
      for (const categoryKey of Object.keys(TEMPLATE_CATEGORIES)) {
        const categoryConfig = TEMPLATE_CATEGORIES[categoryKey as keyof typeof TEMPLATE_CATEGORIES];
        const categoryTemplates = await generateAITemplatesForCategory(
          categoryKey,
          categoryConfig.targetCount
        );
        templates.push(...categoryTemplates);
      }
      stats = getTemplateStats(templates);
    }

    // Optionally save to DynamoDB
    let savedCount = 0;
    if (saveToDb && templates.length > 0) {
      savedCount = await saveTemplatesToDB(templates);
    }

    return NextResponse.json({
      success: true,
      mode,
      stats,
      savedToDb: saveToDb,
      savedCount,
      templates: templates.slice(0, 10), // Return sample of templates
      message: `Generated ${templates.length} templates${saveToDb ? `, saved ${savedCount} to database` : ""}`,
    });
  } catch (error) {
    console.error("Template generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate templates" },
      { status: 500 }
    );
  }
}

/**
 * GET - Get current template stats
 */
export async function GET(request: NextRequest) {
  try {
    // Generate stats from programmatic templates
    const templates = generateAllTemplates();
    const stats = getTemplateStats(templates);

    // Category breakdown
    const categoryBreakdown = Object.entries(TEMPLATE_CATEGORIES).map(([key, value]) => ({
      key,
      name: value.name,
      target: value.targetCount,
      subcategories: value.subcategories.length,
    }));

    return NextResponse.json({
      currentStats: stats,
      targetTotal: Object.values(TEMPLATE_CATEGORIES).reduce((sum, cat) => sum + cat.targetCount, 0),
      categories: categoryBreakdown,
      styles: DESIGN_STYLES,
      palettes: COLOR_PALETTES.length,
      fontPairings: FONT_PAIRINGS.length,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
  }
}
