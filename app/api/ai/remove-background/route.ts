import { NextRequest, NextResponse } from "next/server";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import { verifyAuth } from "@/lib/auth-server";

// Validate URL to prevent SSRF attacks
function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow HTTPS
    if (parsed.protocol !== "https:") return false;
    // Block internal/private IPs
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.") ||
      hostname.endsWith(".local") ||
      hostname.includes("internal")
    ) {
      return false;
    }
    // Only allow our S3 bucket or known image hosts
    const allowedHosts = [
      process.env.AWS_S3_BUCKET + ".s3.amazonaws.com",
      "s3.amazonaws.com",
      "images.unsplash.com",
      "cdn.pixabay.com",
    ];
    return allowedHosts.some((host) => hostname.includes(host));
  } catch {
    return false;
  }
}

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "invitegenerator-uploads";

// Background removal using image processing
// Note: For production, consider using a dedicated service like remove.bg API or AWS Rekognition
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const userId = await verifyAuth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const imageUrl = formData.get("imageUrl") as string | null;

    let imageBuffer: Buffer;

    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_TYPE", message: "Only JPEG, PNG, WebP allowed" } },
          { status: 400 }
        );
      }
      // Handle file upload
      const arrayBuffer = await file.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    } else if (imageUrl) {
      // Validate URL to prevent SSRF
      if (!isValidImageUrl(imageUrl)) {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_URL", message: "URL not allowed" } },
          { status: 400 }
        );
      }
      // Fetch image from validated URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch image from URL");
      }
      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NO_IMAGE", message: "No image provided" },
        },
        { status: 400 }
      );
    }

    // Process image with Sharp for basic background removal
    // This is a simplified approach - for better results, integrate with
    // a dedicated background removal service
    const processedImage = await removeBackground(imageBuffer);

    // Generate unique file key for the processed image
    const uniqueId = uuidv4();
    const key = `processed/${uniqueId}.png`;

    // Upload processed image to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: processedImage,
      ContentType: "image/png",
    });

    await s3Client.send(uploadCommand);

    // Generate public URL
    const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;

    return NextResponse.json({
      success: true,
      data: {
        processedUrl: publicUrl,
        key,
        originalSize: imageBuffer.length,
        processedSize: processedImage.length,
      },
    });
  } catch (error) {
    console.error("Background removal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PROCESSING_ERROR",
          message: error instanceof Error ? error.message : "Failed to process image",
        },
      },
      { status: 500 }
    );
  }
}

// Simple background removal using edge detection and transparency
// For production use, consider integrating with:
// - remove.bg API
// - AWS Rekognition
// - Cloudinary Background Removal
// - TensorFlow.js with a segmentation model
async function removeBackground(imageBuffer: Buffer): Promise<Buffer> {
  try {
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    const { width = 0, height = 0 } = metadata;

    if (width === 0 || height === 0) {
      throw new Error("Invalid image dimensions");
    }

    // Extract raw pixel data
    const { data, info } = await sharp(imageBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Simple background detection based on edge colors
    // This assumes the background is roughly uniform and on the edges
    const edgeColors = getEdgeColors(data, info.width, info.height, info.channels);
    const backgroundColor = getMostCommonColor(edgeColors);

    // Create new buffer with transparency
    const newData = Buffer.alloc(data.length);

    // Threshold for color similarity (adjust for better results)
    const threshold = 30;

    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;

      // Check if this pixel is similar to the background color
      const colorDiff = Math.sqrt(
        Math.pow(r - backgroundColor.r, 2) +
        Math.pow(g - backgroundColor.g, 2) +
        Math.pow(b - backgroundColor.b, 2)
      );

      if (colorDiff < threshold) {
        // Make background transparent
        newData[i] = r;
        newData[i + 1] = g;
        newData[i + 2] = b;
        newData[i + 3] = 0; // Full transparency
      } else {
        // Keep foreground
        newData[i] = r;
        newData[i + 1] = g;
        newData[i + 2] = b;
        newData[i + 3] = 255; // Full opacity
      }
    }

    // Create the output image
    const result = await sharp(newData, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4,
      },
    })
      .png()
      .toBuffer();

    return result;
  } catch (error) {
    console.error("Background removal processing error:", error);
    // Return original image as PNG if processing fails
    return sharp(imageBuffer).png().toBuffer();
  }
}

// Get colors from the edge of the image
function getEdgeColors(
  data: Buffer,
  width: number,
  height: number,
  channels: number
): Array<{ r: number; g: number; b: number }> {
  const colors: Array<{ r: number; g: number; b: number }> = [];

  // Sample from edges
  const samplePoints = [
    // Top edge
    ...Array.from({ length: Math.min(10, width) }, (_, i) => ({
      x: Math.floor((i / 10) * width),
      y: 0,
    })),
    // Bottom edge
    ...Array.from({ length: Math.min(10, width) }, (_, i) => ({
      x: Math.floor((i / 10) * width),
      y: height - 1,
    })),
    // Left edge
    ...Array.from({ length: Math.min(10, height) }, (_, i) => ({
      x: 0,
      y: Math.floor((i / 10) * height),
    })),
    // Right edge
    ...Array.from({ length: Math.min(10, height) }, (_, i) => ({
      x: width - 1,
      y: Math.floor((i / 10) * height),
    })),
  ];

  for (const point of samplePoints) {
    const idx = (point.y * width + point.x) * channels;
    colors.push({
      r: data[idx] ?? 0,
      g: data[idx + 1] ?? 0,
      b: data[idx + 2] ?? 0,
    });
  }

  return colors;
}

// Find the most common color from samples
function getMostCommonColor(
  colors: Array<{ r: number; g: number; b: number }>
): { r: number; g: number; b: number } {
  if (colors.length === 0) {
    return { r: 255, g: 255, b: 255 }; // Default to white
  }

  // Simple average of colors (could be improved with clustering)
  const sum = colors.reduce(
    (acc, color) => ({
      r: acc.r + color.r,
      g: acc.g + color.g,
      b: acc.b + color.b,
    }),
    { r: 0, g: 0, b: 0 }
  );

  return {
    r: Math.round(sum.r / colors.length),
    g: Math.round(sum.g / colors.length),
    b: Math.round(sum.b / colors.length),
  };
}
