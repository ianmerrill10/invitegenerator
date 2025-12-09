/**
 * S3 Templates API
 *
 * Lists AI-generated templates stored in S3
 * GET /api/templates/s3 - List all templates from S3
 */

import { NextRequest, NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

// S3 Configuration
const S3_BUCKET = process.env.S3_TEMPLATES_BUCKET || "invitegenerator-templates-983101357971";
const S3_REGION = process.env.AWS_REGION || "us-east-1";

const s3Client = new S3Client({
  region: S3_REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

export interface S3Template {
  id: string;
  category: string;
  subcategory: string;
  style: string;
  thumbnailUrl: string;
  fullSizeUrl: string;
  createdAt: string;
}

/**
 * Parse template info from S3 key
 * Key format: templates/{category}/{subcategory}/{id}_full.png
 */
function parseTemplateKey(key: string): Partial<S3Template> | null {
  // Match: templates/category/subcategory/tmpl_category_subcategory_style_index_timestamp_full.png
  const match = key.match(/^templates\/([^\/]+)\/([^\/]+)\/(.+)_full\.png$/);
  if (!match) return null;

  const [, category, subcategory, id] = match;

  // Parse style from id: tmpl_category_subcategory_style_index_timestamp
  const idParts = id.split('_');
  const style = idParts.length >= 4 ? idParts[3] : 'elegant';

  return {
    id,
    category,
    subcategory,
    style,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "24"), 100);

    // List objects from S3
    const prefix = category ? `templates/${category}/` : "templates/";

    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: prefix,
      MaxKeys: 1000,
    });

    const response = await s3Client.send(command);

    if (!response.Contents) {
      return NextResponse.json({
        templates: [],
        pagination: { page: 1, limit, total: 0, totalPages: 0 },
      });
    }

    // Filter for _full.png files and parse template info
    const templates: S3Template[] = [];
    const baseUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;

    for (const obj of response.Contents) {
      if (!obj.Key || !obj.Key.endsWith('_full.png')) continue;

      const parsed = parseTemplateKey(obj.Key);
      if (!parsed) continue;

      const thumbKey = obj.Key.replace('_full.png', '_thumb.png');

      templates.push({
        id: parsed.id!,
        category: parsed.category!,
        subcategory: parsed.subcategory!,
        style: parsed.style!,
        thumbnailUrl: `${baseUrl}/${thumbKey}`,
        fullSizeUrl: `${baseUrl}/${obj.Key}`,
        createdAt: obj.LastModified?.toISOString() || new Date().toISOString(),
      });
    }

    // Sort by newest first
    templates.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Apply pagination
    const total = templates.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginated = templates.slice(offset, offset + limit);

    // Get category counts
    const categoryCounts: Record<string, number> = {};
    for (const t of templates) {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    }

    return NextResponse.json({
      templates: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      meta: {
        totalTemplates: total,
        categories: categoryCounts,
        bucket: S3_BUCKET,
      },
    });
  } catch (error) {
    console.error("S3 Templates API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
