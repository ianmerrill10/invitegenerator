/**
 * Lambda function to generate invitation templates using AWS Bedrock
 * Uses Stability AI Stable Image Core model (~$0.01 per image)
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require("sharp");

// Configuration
const S3_BUCKET = process.env.S3_BUCKET || "invitegenerator-templates-983101357971";
const AWS_REGION = process.env.AWS_REGION || "us-west-2"; // Bedrock available in us-west-2

// Clients
const bedrockClient = new BedrockRuntimeClient({ region: AWS_REGION });
const s3Client = new S3Client({ region: "us-east-1" }); // S3 bucket region

// Prodigi print spec: 1748x1748 at 300 DPI
const TEMPLATE_SIZE = 1748;
const THUMBNAIL_SIZE = 400;

// Style moods for prompts
const STYLE_MOODS = {
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
};

// Event-specific elements
const EVENT_ELEMENTS = {
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

// Color palettes
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
  { name: "Champagne", colors: ["#C9B896", "#F8F5F0", "#FFFFFF"] },
];

/**
 * Create prompt for invitation design
 */
function createPrompt(category, subcategory, style, colors) {
  const elements = EVENT_ELEMENTS[category] || "elegant decorations";
  const mood = STYLE_MOODS[style] || "elegant";
  const [primary, secondary] = colors;

  return `Create a beautiful, professional invitation design template for a ${subcategory.replace(/-/g, " ")} ${category.replace(/_/g, " ")} event.

Style: ${style} (${mood})
Color scheme: Primary ${primary}, Secondary ${secondary}
Design elements: ${elements}

Requirements:
- Square format, 1:1 aspect ratio
- Clear central area for text overlay (leave middle empty for event details)
- Decorative elements around edges and corners only
- Professional print quality design
- NO text, letters, numbers, or words in the image
- Elegant borders or decorative frames
- High resolution quality
- The overall feeling should be ${mood}

This is a template background - text will be added separately.`;
}

/**
 * Generate image using Bedrock Stable Diffusion
 */
async function generateWithBedrock(prompt) {
  // Use Stability AI SDXL model (available in Bedrock)
  const modelId = "stability.stable-diffusion-xl-v1";

  const input = {
    text_prompts: [
      {
        text: prompt,
        weight: 1.0,
      },
      {
        text: "text, words, letters, numbers, watermark, signature, blurry, low quality",
        weight: -1.0,
      },
    ],
    cfg_scale: 7,
    steps: 50,
    seed: Math.floor(Math.random() * 4294967295),
    width: 1024,
    height: 1024,
    samples: 1,
  };

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(input),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  if (!responseBody.artifacts || responseBody.artifacts.length === 0) {
    throw new Error("No image generated from Bedrock");
  }

  // Return base64 image data
  return Buffer.from(responseBody.artifacts[0].base64, "base64");
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
      .png({ quality: 80 })
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
async function generateTemplate(category, subcategory, style, colorPalette) {
  const timestamp = Date.now().toString(36);
  const templateId = `tmpl_${category}_${subcategory}_${style}_${timestamp}`
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_");

  // Create prompt
  const prompt = createPrompt(category, subcategory, style, colorPalette.colors);

  // Generate with Bedrock
  const imageBuffer = await generateWithBedrock(prompt);

  // Process image
  const { fullSize, thumbnail } = await processImage(imageBuffer);

  // Upload to S3
  const fullKey = `templates/${category}/${subcategory}/${templateId}_full.png`;
  const thumbKey = `templates/${category}/${subcategory}/${templateId}_thumb.png`;

  const [fullUrl, thumbUrl] = await Promise.all([
    uploadToS3(fullSize, fullKey),
    uploadToS3(thumbnail, thumbKey),
  ]);

  return {
    templateId,
    category,
    subcategory,
    style,
    colors: colorPalette.colors,
    fullSizeUrl: fullUrl,
    thumbnailUrl: thumbUrl,
  };
}

/**
 * Lambda handler
 */
exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event));

  try {
    const { templates } = event;

    if (!templates || !Array.isArray(templates)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "templates array required" }),
      };
    }

    const results = [];
    const errors = [];

    for (const t of templates) {
      try {
        console.log(`Generating: ${t.category}/${t.subcategory}/${t.style}`);

        const colorPalette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];

        const result = await generateTemplate(
          t.category,
          t.subcategory,
          t.style,
          colorPalette
        );

        results.push(result);
        console.log(`Success: ${result.templateId}`);
      } catch (err) {
        console.error(`Failed: ${t.category}/${t.subcategory}/${t.style}`, err.message);
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
