import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import type { DesignElement, InvitationDesign } from "@/types";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

const INVITATIONS_TABLE = process.env.DYNAMODB_INVITATIONS_TABLE || "InviteGenerator-Invitations-production";
const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || "InviteGenerator-Users-production";

interface ExportRequest {
  format: string;
  size: string;
  width: number;
  height: number;
  dpi: number;
  includeBleed?: boolean;
}

// POST /api/invitations/[id]/export - Export invitation for print
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body: ExportRequest = await request.json();
    const { format, size, width, height, dpi = 300, includeBleed } = body;

    if (!format || !size || !width || !height) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "Missing required fields" } },
        { status: 400 }
      );
    }

    // Get invitation from DynamoDB
    const result = await dynamodb.send(
      new GetItemCommand({
        TableName: INVITATIONS_TABLE,
        Key: marshall({ id }),
      })
    );

    if (!result.Item) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Invitation not found" } },
        { status: 404 }
      );
    }

    const invitation = unmarshall(result.Item);

    if (invitation.userId !== auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    // Check premium access
    const isPremiumFormat = format !== "png-standard";
    if (isPremiumFormat) {
      const userResult = await dynamodb.send(
        new GetItemCommand({
          TableName: USERS_TABLE,
          Key: marshall({ id: auth.userId }),
        })
      );
      const user = userResult.Item ? unmarshall(userResult.Item) : null;
      if ((user?.plan || "free") === "free") {
        return NextResponse.json(
          { success: false, error: { code: "UPGRADE_REQUIRED", message: "Upgrade to Pro to access print-quality downloads" } },
          { status: 403 }
        );
      }
    }

    // Calculate output dimensions based on DPI
    const scaleFactor = dpi / 72; // Base is 72 DPI
    const outputWidth = Math.round(width * scaleFactor);
    const outputHeight = Math.round(height * scaleFactor);
    const bleedPx = includeBleed ? Math.round(9 * scaleFactor) : 0; // 9pt = 1/8" bleed
    const totalWidth = outputWidth + bleedPx * 2;
    const totalHeight = outputHeight + bleedPx * 2;

    const design = invitation.designData as InvitationDesign | undefined;
    const safeTitle = String(invitation.title || "invitation").replace(/[^a-z0-9]/gi, "-");

    // Try to get existing S3 preview first
    let imageBuffer: Buffer | null = null;
    const previewKey = invitation.previewUrl
      ? invitation.previewUrl.replace(`https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/`, "")
      : `invitations/${id}/preview.png`;

    try {
      const s3Resp = await s3Client.send(
        new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: previewKey,
        })
      );
      const bytes = await s3Resp.Body?.transformToByteArray();
      if (bytes && bytes.length > 100) {
        imageBuffer = Buffer.from(bytes);
      }
    } catch {
      // No S3 preview available, render from design data
    }

    // If no S3 preview, render from design data using sharp
    if (!imageBuffer) {
      imageBuffer = await renderDesignToImage(design, width, height);
    }

    // Resize to target DPI resolution
    const resizedBuffer = await sharp(imageBuffer)
      .resize(totalWidth, totalHeight, { fit: "cover" })
      .png({ quality: 100 })
      .toBuffer();

    if (format.startsWith("pdf")) {
      // Create proper PDF with embedded PNG using pdf-lib
      const pdfDoc = await PDFDocument.create();
      const pngImage = await pdfDoc.embedPng(resizedBuffer);
      const page = pdfDoc.addPage([totalWidth, totalHeight]);
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: totalWidth,
        height: totalHeight,
      });
      const pdfBytes = await pdfDoc.save();
      const pdfBuffer = Buffer.from(pdfBytes);

      // Upload print-ready file to S3
      await uploadExportToS3(id, pdfBuffer, "pdf");

      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${safeTitle}-${size}.pdf"`,
        },
      });
    } else {
      // Upload print-ready PNG to S3
      await uploadExportToS3(id, resizedBuffer, "png");

      return new NextResponse(new Uint8Array(resizedBuffer), {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="${safeTitle}-${size}-${dpi}dpi.png"`,
        },
      });
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { success: false, error: { code: "EXPORT_FAILED", message: "Failed to export invitation" } },
      { status: 500 }
    );
  }
}

/**
 * Render an invitation design to a PNG buffer using sharp.
 * Builds an SVG from the design elements and composites it onto a background.
 */
async function renderDesignToImage(
  design: InvitationDesign | undefined,
  width: number,
  height: number
): Promise<Buffer> {
  const bgColor = design?.backgroundColor || "#FFFFFF";
  const elements = design?.elements || [];

  // Build SVG from design elements
  const svgElements = elements
    .filter((el: DesignElement) => !el.hidden)
    .sort((a: DesignElement, b: DesignElement) => (a.zIndex || 0) - (b.zIndex || 0))
    .map((el: DesignElement) => renderElementToSVG(el))
    .join("\n");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${escapeXml(bgColor)}" />
  ${svgElements}
</svg>`;

  // Convert SVG to PNG via sharp
  return sharp(Buffer.from(svg))
    .resize(width, height)
    .png()
    .toBuffer();
}

/**
 * Convert a single DesignElement to an SVG fragment.
 */
function renderElementToSVG(el: DesignElement): string {
  const x = el.position?.x || 0;
  const y = el.position?.y || 0;
  const w = el.size?.width || 100;
  const h = el.size?.height || 50;
  const opacity = el.opacity !== undefined ? el.opacity : 1;
  const rotation = el.rotation || 0;

  const transform = rotation
    ? `transform="rotate(${rotation}, ${x + w / 2}, ${y + h / 2})"`
    : "";

  switch (el.type) {
    case "text": {
      const fontSize = el.style?.fontSize || 16;
      const fontFamily = el.style?.fontFamily || "sans-serif";
      const fontWeight = el.style?.fontWeight || "normal";
      const textAlign = el.style?.textAlign || "left";
      const color = el.style?.color || "#000000";
      const textAnchor = textAlign === "center" ? "middle" : textAlign === "right" ? "end" : "start";
      const textX = textAlign === "center" ? x + w / 2 : textAlign === "right" ? x + w : x;

      // Split text into lines for multiline support
      const lines = String(el.content || "").split("\n");
      const lineHeight = (el.style?.lineHeight || 1.4) * fontSize;

      const textLines = lines
        .map((line: string, i: number) =>
          `<tspan x="${textX}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
        )
        .join("");

      return `<text x="${textX}" y="${y + fontSize}" font-family="${escapeXml(fontFamily)}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${escapeXml(color)}" text-anchor="${textAnchor}" opacity="${opacity}" ${transform}>${textLines}</text>`;
    }

    case "shape": {
      const bgColor = el.style?.backgroundColor || "#cccccc";
      const borderColor = el.style?.borderColor || "none";
      const borderWidth = el.style?.borderWidth || 0;
      const borderRadius = el.style?.borderRadius || 0;

      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${borderRadius}" fill="${escapeXml(bgColor)}" stroke="${escapeXml(borderColor)}" stroke-width="${borderWidth}" opacity="${opacity}" ${transform} />`;
    }

    case "image": {
      if (el.content && (el.content.startsWith("http") || el.content.startsWith("data:"))) {
        return `<image x="${x}" y="${y}" width="${w}" height="${h}" href="${escapeXml(el.content)}" preserveAspectRatio="xMidYMid slice" opacity="${opacity}" ${transform} />`;
      }
      // Placeholder for images without URL
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f0f0f0" stroke="#ddd" stroke-width="1" opacity="${opacity}" ${transform} />`;
    }

    case "divider": {
      const color = el.style?.borderColor || el.style?.color || "#cccccc";
      const strokeWidth = el.style?.borderWidth || 1;
      return `<line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" stroke="${escapeXml(color)}" stroke-width="${strokeWidth}" opacity="${opacity}" ${transform} />`;
    }

    default:
      return "";
  }
}

/**
 * Upload the exported file to S3 for Prodigi to access.
 */
async function uploadExportToS3(
  invitationId: string,
  buffer: Buffer,
  format: string
): Promise<string | null> {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) return null;

  const key = `exports/${invitationId}/print-ready.${format}`;

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: format === "pdf" ? "application/pdf" : "image/png",
        CacheControl: "max-age=86400",
      })
    );
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  } catch {
    return null;
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
