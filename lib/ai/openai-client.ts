/**
 * OpenAI/DALL-E Client for Template Generation
 *
 * Generates backgrounds and decorative elements for invitation templates.
 */

import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ImageGenerationOptions {
  prompt: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
  n?: number;
}

export interface GeneratedImage {
  url: string;
  revisedPrompt?: string;
}

/**
 * Generate an image using DALL-E 3
 */
export async function generateImage(options: ImageGenerationOptions): Promise<GeneratedImage> {
  const { prompt, size = "1024x1024", quality = "hd", style = "natural", n = 1 } = options;

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    size,
    quality,
    style,
    n,
  });

  if (!response.data || response.data.length === 0 || !response.data[0].url) {
    throw new Error("No image generated from DALL-E");
  }

  return {
    url: response.data[0].url,
    revisedPrompt: response.data[0].revised_prompt,
  };
}

/**
 * Generate a template background
 */
export async function generateBackground(
  eventType: string,
  style: string,
  colorPalette: string[],
  mood: string
): Promise<GeneratedImage> {
  const primaryColor = colorPalette[0];
  const secondaryColor = colorPalette[1];
  const accentColor = colorPalette[2];

  const prompt = `Create a beautiful invitation background for a ${eventType} event in ${style} style.
Color palette: primary ${primaryColor}, secondary ${secondaryColor}, accent ${accentColor}.
Mood: ${mood}.
Requirements:
- Square format (1:1 ratio)
- Leave clear central space for text overlay
- Subtle, elegant design that doesn't overpower text
- High resolution, print quality (300 DPI aesthetic)
- No text, letters, or words in the image
- Decorative elements around edges only
- Professional invitation quality`;

  return generateImage({
    prompt,
    size: "1024x1024",
    quality: "hd",
    style: "natural",
  });
}

/**
 * Generate decorative elements (borders, corners, flourishes)
 */
export async function generateDecoration(
  decorationType: "border" | "corner" | "flourish" | "divider" | "frame",
  style: string,
  color: string
): Promise<GeneratedImage> {
  const decorationPrompts: Record<string, string> = {
    border: `Elegant ${style} decorative border frame, ${color} colored, ornate design, transparent background suitable for overlaying on invitations, no text, isolated element`,
    corner: `Beautiful ${style} corner decoration, ${color} colored, elegant flourish, transparent background, isolated decorative element for invitation corners`,
    flourish: `Delicate ${style} flourish ornament, ${color} colored, swirl design, transparent background, isolated decorative element`,
    divider: `Elegant ${style} text divider line, ${color} colored, decorative separator, transparent background, horizontal ornament`,
    frame: `Complete ${style} decorative frame, ${color} colored, elegant border all around, transparent center for text, invitation quality`,
  };

  return generateImage({
    prompt: decorationPrompts[decorationType],
    size: "1024x1024",
    quality: "standard",
    style: "natural",
  });
}

/**
 * Generate themed illustrations
 */
export async function generateIllustration(
  theme: string,
  style: string,
  elements: string[]
): Promise<GeneratedImage> {
  const elementList = elements.join(", ");

  const prompt = `Create a ${style} style illustration for a ${theme} themed invitation.
Include these elements: ${elementList}.
Requirements:
- Clean, isolated elements
- Transparent or white background
- High quality, vector-like appearance
- No text or letters
- Suitable for print at 300 DPI
- Elegant and professional`;

  return generateImage({
    prompt,
    size: "1024x1024",
    quality: "hd",
    style: "natural",
  });
}

/**
 * Batch generate multiple backgrounds with rate limiting
 */
export async function batchGenerateBackgrounds(
  requests: Array<{
    eventType: string;
    style: string;
    colorPalette: string[];
    mood: string;
  }>,
  delayMs: number = 1000
): Promise<GeneratedImage[]> {
  const results: GeneratedImage[] = [];

  for (const request of requests) {
    try {
      const image = await generateBackground(
        request.eventType,
        request.style,
        request.colorPalette,
        request.mood
      );
      results.push(image);

      // Rate limiting delay
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error("Failed to generate background:", error);
      // Continue with other requests
    }
  }

  return results;
}

export { openai };
