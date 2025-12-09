/**
 * Template Generation Orchestrator
 *
 * Coordinates the AI template generation pipeline:
 * 1. Calls DALL-E for complete invitation design generation
 * 2. Processes images with Sharp (resize, thumbnails)
 * 3. Stores results in S3
 *
 * Based on Gemini's recommended architecture.
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  TEMPLATE_CATEGORIES,
  DESIGN_STYLES,
  COLOR_PALETTES,
  FONT_PAIRINGS,
} from "../template-generator";
import { generateImage } from "./openai-client";
import {
  processTemplateImage,
  createGradientPlaceholder,
  generateThumbnail,
} from "./template-composer";

// S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const S3_BUCKET = process.env.S3_BUCKET_NAME || "invitegenerator-uploads";

export interface GenerationConfig {
  categories?: string[];
  stylesPerCategory?: number;
  useAIBackgrounds?: boolean;
  batchSize?: number;
  delayBetweenBatches?: number;
}

export interface GenerationResult {
  templateId: string;
  success: boolean;
  thumbnailUrl?: string;
  fullSizeUrl?: string;
  error?: string;
  metadata?: {
    category: string;
    subcategory: string;
    style: string;
    colors: string[];
    fonts: string[];
  };
}

export interface BatchGenerationProgress {
  total: number;
  completed: number;
  failed: number;
  currentCategory: string;
  currentSubcategory: string;
  results: GenerationResult[];
}

/**
 * Style mood mappings for DALL-E prompts
 */
const STYLE_MOODS: Record<string, string> = {
  minimalist: "clean, simple, lots of white space, subtle, refined",
  elegant: "sophisticated, graceful, luxurious, refined, high-end",
  modern: "contemporary, fresh, sleek, trendy, geometric",
  vintage: "retro, nostalgic, classic, antique charm, timeless",
  rustic: "natural, earthy, farmhouse, organic, warm wood tones",
  bohemian: "free-spirited, eclectic, artistic, natural, layered textures",
  tropical: "vibrant, lush, exotic, paradise, palm fronds and flowers",
  romantic: "soft, dreamy, delicate, pastel, roses and hearts",
  playful: "fun, colorful, energetic, whimsical, party vibes",
  luxurious: "opulent, gold accents, marble, velvet, rich textures",
  whimsical: "magical, fairytale, dreamy, fantastical, enchanted",
  classic: "traditional, timeless, formal, distinguished, heritage",
  "art-deco": "geometric, gold, 1920s glamour, gatsby, bold lines",
  watercolor: "soft washes, painted, artistic, flowing, delicate",
  geometric: "bold shapes, angular, modern patterns, structured",
  floral: "flowers, blooms, garden, botanical, romantic petals",
  botanical: "green leaves, nature, organic, plants, garden fresh",
  abstract: "artistic, creative, expressive, unique patterns",
  "photo-centric": "photo frame style, memories, snapshot aesthetic",
  "typography-focused": "text-forward, minimalist, font-focused, editorial",
};

/**
 * Event-specific design elements
 */
const EVENT_ELEMENTS: Record<string, string> = {
  wedding: "rings, flowers, doves, hearts, elegant script",
  birthday: "balloons, confetti, cake, candles, celebration",
  baby_shower: "baby items, stork, soft pastels, rattles, clouds",
  bridal_shower: "flowers, champagne, dress silhouette, hearts",
  graduation: "cap and gown, diploma, stars, academic elements",
  corporate: "professional, clean lines, geometric, modern",
  holiday: "seasonal decorations, festive elements, traditional motifs",
  dinner_party: "elegant table setting, wine glasses, candles",
  anniversary: "intertwined hearts, roses, gold accents, rings",
  engagement: "diamond ring, champagne, hearts, romantic florals",
  housewarming: "house silhouette, keys, plants, home elements",
  retirement: "celebration, gold watch, flowers, achievement",
  reunion: "group silhouette, memories, nostalgic elements",
  religious: "appropriate religious symbols, elegant, reverent",
  kids_party: "fun characters, bright colors, toys, games",
  sports: "sports equipment, action lines, team colors",
  seasonal: "nature elements matching the season",
};

/**
 * Generate a unique template ID
 */
function generateId(category: string, subcategory: string, style: string, index: number): string {
  const timestamp = Date.now().toString(36);
  return `tmpl_${category}_${subcategory}_${style}_${index}_${timestamp}`
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_");
}

/**
 * Create DALL-E prompt for complete invitation design
 */
function createInvitationPrompt(
  eventType: string,
  subcategory: string,
  style: string,
  colors: string[],
  mood: string
): string {
  const elements = EVENT_ELEMENTS[eventType] || "elegant decorations";
  const [primary, secondary, accent] = colors;

  return `Create a beautiful, professional invitation design for a ${subcategory.replace(/-/g, " ")} ${eventType} event.

Style: ${style} (${mood})
Color scheme: Primary ${primary}, Secondary ${secondary}, Accent ${accent}
Design elements: ${elements}

Requirements:
- Square format (1:1 aspect ratio)
- Clear central area for text (leave space in the middle for event details)
- Decorative elements around the edges and corners
- Professional print quality design
- NO actual text, letters, numbers, or words in the image
- The design should frame where text would go
- Elegant borders or decorative frames
- High resolution, suitable for 300 DPI printing
- The overall feeling should be ${mood}

This is a template background - text will be added separately by the user.`;
}

/**
 * Upload a buffer to S3
 */
async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string = "image/png"
): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000",
    })
  );

  return `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
}

/**
 * Generate a single template with DALL-E
 */
export async function generateSingleTemplate(
  category: string,
  subcategory: string,
  style: string,
  colorPalette: { name: string; colors: string[] },
  fonts: { heading: string; body: string },
  useAIBackground: boolean = true
): Promise<GenerationResult> {
  const templateId = generateId(category, subcategory, style, Date.now());

  try {
    let fullSizeBuffer: Buffer;
    let thumbnailBuffer: Buffer;

    if (useAIBackground) {
      // Generate complete invitation design with DALL-E
      const categoryInfo = TEMPLATE_CATEGORIES[category as keyof typeof TEMPLATE_CATEGORIES];
      const eventType = categoryInfo?.name || category;
      const mood = STYLE_MOODS[style] || "elegant";

      const prompt = createInvitationPrompt(
        category,
        subcategory,
        style,
        colorPalette.colors,
        mood
      );

      const result = await generateImage({
        prompt,
        size: "1024x1024",
        quality: "hd",
        style: "natural",
      });

      // Process the generated image
      const processed = await processTemplateImage(result.url);
      fullSizeBuffer = processed.fullSize;
      thumbnailBuffer = processed.thumbnail;
    } else {
      // Create gradient placeholder
      fullSizeBuffer = await createGradientPlaceholder(colorPalette.colors);
      thumbnailBuffer = await generateThumbnail(fullSizeBuffer);
    }

    // Upload to S3
    const fullSizeKey = `templates/${category}/${subcategory}/${templateId}_full.png`;
    const thumbnailKey = `templates/${category}/${subcategory}/${templateId}_thumb.png`;

    const [fullSizeUrl, thumbnailUrl] = await Promise.all([
      uploadToS3(fullSizeBuffer, fullSizeKey),
      uploadToS3(thumbnailBuffer, thumbnailKey),
    ]);

    return {
      templateId,
      success: true,
      fullSizeUrl,
      thumbnailUrl,
      metadata: {
        category,
        subcategory,
        style,
        colors: colorPalette.colors,
        fonts: [fonts.heading, fonts.body],
      },
    };
  } catch (error) {
    console.error(`Failed to generate template ${templateId}:`, error);
    return {
      templateId,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate templates for a specific category
 */
export async function generateCategoryTemplates(
  categoryKey: string,
  config: GenerationConfig = {},
  onProgress?: (progress: BatchGenerationProgress) => void
): Promise<GenerationResult[]> {
  const category = TEMPLATE_CATEGORIES[categoryKey as keyof typeof TEMPLATE_CATEGORIES];
  if (!category) {
    throw new Error(`Unknown category: ${categoryKey}`);
  }

  const results: GenerationResult[] = [];
  const {
    stylesPerCategory = 5,
    useAIBackgrounds = true,
    batchSize = 5,
    delayBetweenBatches = 2000,
  } = config;

  const subcategories = category.subcategories;
  const totalTemplates = subcategories.length * stylesPerCategory;

  let completed = 0;

  for (const subcategory of subcategories) {
    // Select diverse styles for this subcategory
    const selectedStyles = DESIGN_STYLES.slice(0, stylesPerCategory);

    for (const style of selectedStyles) {
      // Pick a color palette and font pairing
      const colorPalette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
      const fonts = FONT_PAIRINGS[Math.floor(Math.random() * FONT_PAIRINGS.length)];

      // Generate template
      const result = await generateSingleTemplate(
        categoryKey,
        subcategory,
        style,
        colorPalette,
        fonts,
        useAIBackgrounds
      );

      results.push(result);
      completed++;

      // Report progress
      if (onProgress) {
        onProgress({
          total: totalTemplates,
          completed,
          failed: results.filter((r) => !r.success).length,
          currentCategory: categoryKey,
          currentSubcategory: subcategory,
          results,
        });
      }

      // Rate limiting between templates
      if (completed % batchSize === 0 && useAIBackgrounds) {
        await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
      }
    }
  }

  return results;
}

/**
 * Generate all templates across all categories
 * Target: 1000+ templates
 */
export async function generateAllTemplates(
  config: GenerationConfig = {},
  onProgress?: (progress: BatchGenerationProgress) => void
): Promise<GenerationResult[]> {
  const allResults: GenerationResult[] = [];
  const categories = config.categories || Object.keys(TEMPLATE_CATEGORIES);

  const totalTemplates = categories.reduce((sum, key) => {
    const cat = TEMPLATE_CATEGORIES[key as keyof typeof TEMPLATE_CATEGORIES];
    return sum + (cat?.subcategories.length || 0) * (config.stylesPerCategory || 5);
  }, 0);

  for (const categoryKey of categories) {
    console.log(`Starting generation for category: ${categoryKey}`);

    const categoryResults = await generateCategoryTemplates(categoryKey, config, (progress) => {
      if (onProgress) {
        onProgress({
          ...progress,
          completed: allResults.length + progress.completed,
          total: totalTemplates,
          results: [...allResults, ...progress.results],
        });
      }
    });

    allResults.push(...categoryResults);

    // Delay between categories
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  return allResults;
}

/**
 * Generate templates without AI backgrounds (faster, cheaper)
 * Uses gradient backgrounds with proper styling
 */
export async function generateGradientTemplates(
  config: Omit<GenerationConfig, "useAIBackgrounds"> = {},
  onProgress?: (progress: BatchGenerationProgress) => void
): Promise<GenerationResult[]> {
  return generateAllTemplates({ ...config, useAIBackgrounds: false }, onProgress);
}

/**
 * Estimate generation cost for AI backgrounds
 */
export function estimateGenerationCost(templateCount: number): {
  dalleCost: number;
  estimatedTime: string;
  totalCost: number;
} {
  // DALL-E 3 HD pricing: ~$0.080 per image
  const dallePrice = 0.08;
  const dalleCost = templateCount * dallePrice;

  // Estimate ~10 seconds per template with AI backgrounds
  const totalSeconds = templateCount * 10;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return {
    dalleCost,
    estimatedTime: `${hours}h ${minutes}m`,
    totalCost: dalleCost,
  };
}

/**
 * Get generation plan summary
 */
export function getGenerationPlan(config: GenerationConfig = {}): {
  categories: number;
  subcategories: number;
  stylesPerSubcategory: number;
  totalTemplates: number;
  estimatedCost: ReturnType<typeof estimateGenerationCost>;
} {
  const categories = config.categories || Object.keys(TEMPLATE_CATEGORIES);
  const stylesPerSubcategory = config.stylesPerCategory || 5;

  let totalSubcategories = 0;
  for (const categoryKey of categories) {
    const category = TEMPLATE_CATEGORIES[categoryKey as keyof typeof TEMPLATE_CATEGORIES];
    if (category) {
      totalSubcategories += category.subcategories.length;
    }
  }

  const totalTemplates = totalSubcategories * stylesPerSubcategory;

  return {
    categories: categories.length,
    subcategories: totalSubcategories,
    stylesPerSubcategory,
    totalTemplates,
    estimatedCost: estimateGenerationCost(totalTemplates),
  };
}
