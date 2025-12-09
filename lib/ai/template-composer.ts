/**
 * Template Composer using Sharp
 *
 * Generates invitation templates by:
 * 1. Generating complete designs via DALL-E
 * 2. Processing and resizing with Sharp
 * 3. Creating thumbnails for web display
 *
 * Output: 1748x1748px at 300 DPI (Prodigi print spec)
 */

import sharp from "sharp";

// Prodigi print spec: 148mm x 148mm at 300 DPI = 1748px x 1748px
export const TEMPLATE_WIDTH = 1748;
export const TEMPLATE_HEIGHT = 1748;
export const THUMBNAIL_WIDTH = 400;

export interface TemplateMetadata {
  category: string;
  subcategory: string;
  style: string;
  colorPalette: string[];
  fonts: string[];
}

/**
 * Download image from URL and return as buffer
 */
export async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Resize image to Prodigi print specifications (1748x1748)
 */
export async function resizeForPrint(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .resize(TEMPLATE_WIDTH, TEMPLATE_HEIGHT, {
      fit: "cover",
      position: "center",
    })
    .png({ quality: 100, compressionLevel: 6 })
    .toBuffer();
}

/**
 * Generate thumbnail for web display
 */
export async function generateThumbnail(
  imageBuffer: Buffer,
  width: number = THUMBNAIL_WIDTH
): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const aspectRatio = (metadata.height || 1) / (metadata.width || 1);
  const height = Math.round(width * aspectRatio);

  return sharp(imageBuffer)
    .resize(width, height, {
      fit: "cover",
      position: "center",
    })
    .png({ quality: 80, compressionLevel: 9 })
    .toBuffer();
}

/**
 * Process a DALL-E generated image for template use
 */
export async function processTemplateImage(
  imageUrl: string
): Promise<{ fullSize: Buffer; thumbnail: Buffer }> {
  // Download the image
  const originalBuffer = await downloadImage(imageUrl);

  // Process in parallel
  const [fullSize, thumbnail] = await Promise.all([
    resizeForPrint(originalBuffer),
    generateThumbnail(originalBuffer),
  ]);

  return { fullSize, thumbnail };
}

/**
 * Create a gradient placeholder image (for when DALL-E is not used)
 */
export async function createGradientPlaceholder(
  colors: string[],
  width: number = TEMPLATE_WIDTH,
  height: number = TEMPLATE_HEIGHT
): Promise<Buffer> {
  // Create SVG gradient
  const color1 = colors[0] || "#FFFFFF";
  const color2 = colors[1] || colors[0] || "#F5F5F5";
  const accentColor = colors[2] || color1;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" style="stop-color:${color2};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color1};stop-opacity:1" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>

      <!-- Decorative border -->
      <rect x="60" y="60" width="${width - 120}" height="${height - 120}"
            fill="none" stroke="${accentColor}" stroke-width="2" opacity="0.3"/>

      <!-- Corner decorations -->
      <circle cx="80" cy="80" r="8" fill="${accentColor}" opacity="0.4"/>
      <circle cx="${width - 80}" cy="80" r="8" fill="${accentColor}" opacity="0.4"/>
      <circle cx="80" cy="${height - 80}" r="8" fill="${accentColor}" opacity="0.4"/>
      <circle cx="${width - 80}" cy="${height - 80}" r="8" fill="${accentColor}" opacity="0.4"/>

      <!-- Center decoration -->
      <line x1="${width / 2 - 150}" y1="${height / 2 - 200}"
            x2="${width / 2 + 150}" y2="${height / 2 - 200}"
            stroke="${accentColor}" stroke-width="1" opacity="0.5"/>
      <line x1="${width / 2 - 150}" y1="${height / 2 + 300}"
            x2="${width / 2 + 150}" y2="${height / 2 + 300}"
            stroke="${accentColor}" stroke-width="1" opacity="0.5"/>

      <!-- Placeholder text area indicators -->
      <text x="${width / 2}" y="${height / 2 - 100}"
            font-family="Georgia, serif" font-size="72"
            fill="${accentColor}" text-anchor="middle" opacity="0.15">
        [Event Title]
      </text>
      <text x="${width / 2}" y="${height / 2 + 50}"
            font-family="Arial, sans-serif" font-size="36"
            fill="${accentColor}" text-anchor="middle" opacity="0.15">
        [Date & Time]
      </text>
      <text x="${width / 2}" y="${height / 2 + 120}"
            font-family="Arial, sans-serif" font-size="28"
            fill="${accentColor}" text-anchor="middle" opacity="0.15">
        [Location]
      </text>
    </svg>
  `;

  return sharp(Buffer.from(svg))
    .png({ quality: 100 })
    .toBuffer();
}

/**
 * Add text overlay to an image using SVG
 * This creates a preview with sample text
 */
export async function addTextOverlay(
  imageBuffer: Buffer,
  text: {
    title: string;
    subtitle?: string;
    date?: string;
    location?: string;
  },
  style: {
    titleColor?: string;
    textColor?: string;
    fontFamily?: string;
  } = {}
): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || TEMPLATE_WIDTH;
  const height = metadata.height || TEMPLATE_HEIGHT;

  const titleColor = style.titleColor || "#1C1917";
  const textColor = style.textColor || "#44403C";
  const fontFamily = style.fontFamily || "Georgia, serif";

  const textSvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Semi-transparent overlay for text readability -->
      <rect x="${width * 0.1}" y="${height * 0.25}"
            width="${width * 0.8}" height="${height * 0.5}"
            fill="white" opacity="0.85" rx="20"/>

      ${text.subtitle ? `
        <text x="${width / 2}" y="${height * 0.35}"
              font-family="${fontFamily}" font-size="36"
              fill="${textColor}" text-anchor="middle">
          ${escapeXml(text.subtitle)}
        </text>
      ` : ""}

      <text x="${width / 2}" y="${height * 0.45}"
            font-family="${fontFamily}" font-size="64" font-weight="bold"
            fill="${titleColor}" text-anchor="middle">
        ${escapeXml(text.title)}
      </text>

      ${text.date ? `
        <text x="${width / 2}" y="${height * 0.55}"
              font-family="Arial, sans-serif" font-size="32"
              fill="${textColor}" text-anchor="middle">
          ${escapeXml(text.date)}
        </text>
      ` : ""}

      ${text.location ? `
        <text x="${width / 2}" y="${height * 0.62}"
              font-family="Arial, sans-serif" font-size="28"
              fill="${textColor}" text-anchor="middle">
          ${escapeXml(text.location)}
        </text>
      ` : ""}
    </svg>
  `;

  return sharp(imageBuffer)
    .composite([
      {
        input: Buffer.from(textSvg),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(
  imageBuffer: Buffer
): Promise<{ width: number; height: number }> {
  const metadata = await sharp(imageBuffer).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}

/**
 * Convert image to different format
 */
export async function convertImage(
  imageBuffer: Buffer,
  format: "png" | "jpeg" | "webp"
): Promise<Buffer> {
  const image = sharp(imageBuffer);

  switch (format) {
    case "jpeg":
      return image.jpeg({ quality: 90 }).toBuffer();
    case "webp":
      return image.webp({ quality: 85 }).toBuffer();
    case "png":
    default:
      return image.png({ compressionLevel: 6 }).toBuffer();
  }
}
