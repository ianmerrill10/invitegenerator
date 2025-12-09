/**
 * Lambda function to generate invitation templates using AWS Bedrock
 * Uses Stability AI Stable Diffusion 3.5 Large - BEST QUALITY
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require("sharp");

// Configuration
const S3_BUCKET = process.env.S3_BUCKET || "invitegenerator-templates-983101357971";
const BEDROCK_REGION = process.env.BEDROCK_REGION || "us-west-2"; // SD3.5 available in us-west-2
const S3_REGION = "us-east-1";

// Clients
const bedrockClient = new BedrockRuntimeClient({ region: BEDROCK_REGION });
const s3Client = new S3Client({ region: S3_REGION });

// Prodigi print spec: 1748x1748 at 300 DPI
const TEMPLATE_SIZE = 1748;
const THUMBNAIL_SIZE = 400;

// Style descriptions for prompts
const STYLE_MOODS = {
  minimalist: "clean, simple, lots of white space, subtle, refined, minimal decoration, zen-like simplicity",
  elegant: "sophisticated, graceful, luxurious, refined, high-end aesthetic, opulent details",
  modern: "contemporary, fresh, sleek, trendy, geometric shapes, sharp lines, bold contrasts",
  vintage: "retro, nostalgic, classic, antique charm, timeless appeal, sepia tones, ornate borders",
  rustic: "natural, earthy, farmhouse style, organic textures, warm wood tones, burlap and lace",
  bohemian: "free-spirited, eclectic, artistic, natural materials, layered textures, dreamcatcher motifs",
  tropical: "vibrant colors, lush greenery, exotic flowers, paradise theme, palm leaves, hibiscus",
  romantic: "soft colors, dreamy, delicate florals, pastel tones, hearts and roses, soft focus",
  playful: "fun, colorful, energetic, whimsical elements, party vibes, confetti, bright patterns",
  luxurious: "opulent, gold accents, marble textures, velvet, rich materials, crystal elements",
  whimsical: "magical, fairytale elements, dreamy, fantastical, enchanted forest, sparkling stars",
  classic: "traditional, timeless, formal, distinguished, heritage style, symmetrical design",
};

// Event-specific design elements
const EVENT_ELEMENTS = {
  wedding: "wedding rings, elegant flowers like roses and peonies, doves, hearts, flowing silk ribbons, wedding bells",
  birthday: "balloons, confetti, birthday cake with candles, streamers, gift boxes, celebration elements",
  baby_shower: "baby items, stork, soft pastels, rattles, fluffy clouds, cute baby animals, footprints",
  bridal_shower: "flowers, champagne glasses, wedding dress silhouette, hearts, diamond ring, pearls",
  graduation: "graduation cap, diploma scroll, stars, academic laurel wreath, books, achievement medals",
  corporate: "professional geometric patterns, clean lines, modern shapes, abstract art, business elements",
  holiday: "seasonal decorations, festive ornaments, traditional motifs, holly, snowflakes, lights",
  dinner_party: "elegant table setting elements, wine glasses, candles, silverware, fine china",
  anniversary: "intertwined hearts, red roses, gold accents, champagne, celebration symbols, love birds",
  engagement: "diamond ring, champagne, hearts, romantic florals, sparkles, love knots",
  housewarming: "house silhouette, golden keys, potted plants, home decor elements, welcome wreaths",
  retirement: "celebration elements, gold watch, flowers, achievement symbols, sunset imagery",
  reunion: "connected silhouettes, memory-themed elements, nostalgic items, family tree",
  religious: "elegant religious symbols, reverent decorative elements, stained glass patterns, doves",
  kids_party: "fun cartoon elements, bright rainbow colors, toys, party games, cartoon characters",
  sports: "sports equipment outlines, action lines, dynamic shapes, victory elements, medals",
  seasonal: "nature elements matching the season, seasonal flowers and colors, weather elements",
};

// Color palettes optimized for invitations
const COLOR_PALETTES = [
  { name: "Blush Rose", colors: ["#D4919F", "#F5E1E5", "#FFFFFF"] },
  { name: "Sage Garden", colors: ["#87A878", "#E8F0E5", "#FFFFFF"] },
  { name: "Ocean Blue", colors: ["#4A90A4", "#E0F0F5", "#FFFFFF"] },
  { name: "Sunset Gold", colors: ["#D4A574", "#FFF5E8", "#FFFFFF"] },
  { name: "Lavender Dream", colors: ["#9B8AA6", "#F0EBF5", "#FFFFFF"] },
  { name: "Midnight Navy", colors: ["#2C3E50", "#E8ECF0", "#FFFFFF"] },
  { name: "Terracotta", colors: ["#C4785A", "#F5EBE6", "#FFFFFF"] },
  { name: "Forest Green", colors: ["#2D5A4A", "#E5F0EB", "#FFFFFF"] },
  { name: "Dusty Mauve", colors: ["#B08D9B", "#F5EEF0", "#FFFFFF"] },
  { name: "Champagne Gold", colors: ["#C9B896", "#F8F5F0", "#FFFFFF"] },
  { name: "Royal Purple", colors: ["#6B4C7A", "#E8E0ED", "#FFFFFF"] },
  { name: "Coral Sunset", colors: ["#E07B6C", "#FCE8E5", "#FFFFFF"] },
];

/**
 * Create optimized prompt for Stable Diffusion 3.5 Large
 */
function createPrompt(category, subcategory, style, colors) {
  const elements = EVENT_ELEMENTS[category] || "elegant decorative elements";
  const mood = STYLE_MOODS[style] || "elegant and refined";
  const [primary, secondary] = colors;

  return `A stunning, ultra high quality professional invitation template design for a ${subcategory.replace(/-/g, " ")} ${category.replace(/_/g, " ")} event.

Art style: ${mood}
Design elements: ${elements}
Color scheme: Primary ${primary}, secondary ${secondary}, white and cream accents

The design features:
- Ornate decorative borders and corner flourishes
- Clear empty center space for text overlay
- Intricate details around the edges
- Professional print-ready quality
- Elegant symmetrical composition
- Rich textures and depth
- No text, words, or letters anywhere in the design

Masterpiece quality, award-winning invitation design, 8K resolution, photorealistic details, professional graphic design.`;
}

/**
 * Generate image using Stable Diffusion 3.5 Large via Bedrock
 */
async function generateWithSD35(prompt) {
  // Stable Diffusion 3.5 Large model ID
  const modelId = "stability.sd3-5-large-v1:0";

  const input = {
    prompt: prompt,
    negative_prompt: "text, words, letters, numbers, watermark, signature, blurry, low quality, distorted, ugly, bad composition, amateur, poorly designed, cheap looking, clipart, stock photo watermark",
    mode: "text-to-image",
    aspect_ratio: "1:1",
    output_format: "png",
    seed: Math.floor(Math.random() * 4294967295),
  };

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(input),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  if (!responseBody.images || responseBody.images.length === 0) {
    throw new Error("No image generated from SD3.5");
  }

  return Buffer.from(responseBody.images[0], "base64");
}

/**
 * Process image: resize to print size and create thumbnail
 */
async function processImage(imageBuffer) {
  const [fullSize, thumbnail] = await Promise.all([
    sharp(imageBuffer)
      .resize(TEMPLATE_SIZE, TEMPLATE_SIZE, { fit: "cover" })
      .png({ quality: 100 })
      .toBuffer(),
    sharp(imageBuffer)
      .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: "cover" })
      .png({ quality: 85 })
      .toBuffer(),
  ]);

  return { fullSize, thumbnail };
}

/**
 * Upload to S3
 */
async function uploadToS3(buffer, key) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "image/png",
      CacheControl: "public, max-age=31536000",
    })
  );
  return `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
}

/**
 * Generate a single template
 */
async function generateTemplate(category, subcategory, style) {
  const timestamp = Date.now().toString(36);
  const randomId = Math.random().toString(36).substring(2, 6);
  const templateId = `tmpl_${category}_${subcategory}_${style}_${randomId}_${timestamp}`
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_");

  // Select random color palette
  const colorPalette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];

  // Create prompt
  const prompt = createPrompt(category, subcategory, style, colorPalette.colors);

  // Generate with SD 3.5 Large
  const imageBuffer = await generateWithSD35(prompt);

  // Process image (resize + thumbnail)
  const { fullSize, thumbnail } = await processImage(imageBuffer);

  // Upload to S3
  const fullKey = `templates/${category}/${subcategory}/${templateId}_full.png`;
  const thumbKey = `templates/${category}/${subcategory}/${templateId}_thumb.png`;

  await Promise.all([
    uploadToS3(fullSize, fullKey),
    uploadToS3(thumbnail, thumbKey),
  ]);

  return {
    templateId,
    category,
    subcategory,
    style,
    colors: colorPalette.colors,
    colorName: colorPalette.name,
  };
}

/**
 * Lambda handler - processes batch of templates
 */
exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event));

  try {
    const { templates } = event;

    if (!templates || !Array.isArray(templates) || templates.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "templates array required" }),
      };
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < templates.length; i++) {
      const t = templates[i];
      try {
        console.log(`[${i + 1}/${templates.length}] Generating: ${t.category}/${t.subcategory}/${t.style}`);

        const result = await generateTemplate(t.category, t.subcategory, t.style);

        results.push(result);
        console.log(`[${i + 1}/${templates.length}] Success: ${result.templateId}`);
      } catch (err) {
        console.error(`[${i + 1}/${templates.length}] Failed: ${t.category}/${t.subcategory}/${t.style}`, err.message);
        errors.push({
          template: t,
          error: err.message,
        });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: results.length,
        failed: errors.length,
        total: templates.length,
        results,
        errors,
      }),
    };
  } catch (error) {
    console.error("Handler error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
