/**
 * Protected Templates API
 *
 * Serves templates with:
 * - Hotlink prevention
 * - Rate limiting
 * - Access token validation
 * - Anti-theft headers
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  HOTLINK_PREVENTION_HEADERS,
  isAllowedOrigin,
  checkRateLimit,
  validateAccessToken,
} from '@/lib/template-protection';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const TEMPLATES_BUCKET = 'invitegenerator-templates-983101357971';

export async function GET(request: NextRequest) {
  try {
    // Get request info
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // Check origin - allow during development
    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev && !isAllowedOrigin(referer, host)) {
      return new NextResponse('Hotlinking not allowed', {
        status: 403,
        headers: HOTLINK_PREVENTION_HEADERS,
      });
    }

    // Rate limiting
    if (!checkRateLimit(ip, 60)) {
      return new NextResponse('Rate limit exceeded', {
        status: 429,
        headers: {
          ...HOTLINK_PREVENTION_HEADERS,
          'Retry-After': '60',
        },
      });
    }

    // Get parameters
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');
    const type = searchParams.get('type') || 'thumb';
    const token = searchParams.get('token');

    if (!templateId) {
      return new NextResponse('Template ID required', { status: 400 });
    }

    // Validate token if provided
    if (token) {
      const validation = validateAccessToken(token);
      if (!validation.valid) {
        return new NextResponse('Invalid or expired token', { status: 401 });
      }
    }

    // Build S3 key from templateId
    // templateId format: tmpl_category_subcategory_style_uniqueid
    const parts = templateId.split('_');
    if (parts.length < 4) {
      return new NextResponse('Invalid template ID format', { status: 400 });
    }

    const category = parts[1];
    const subcategory = parts[2];
    const suffix = type === 'full' ? '_full.png' : '_thumb.png';
    const s3Key = `templates/${category}/${subcategory}/${templateId}${suffix}`;

    // Generate presigned URL (short-lived)
    const command = new GetObjectCommand({
      Bucket: TEMPLATES_BUCKET,
      Key: s3Key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300, // 5 minutes
    });

    // Redirect to presigned URL with protection headers
    return NextResponse.redirect(presignedUrl, {
      status: 302,
      headers: {
        ...HOTLINK_PREVENTION_HEADERS,
        'X-Template-Protection': 'active',
        'X-Template-ID': templateId,
      },
    });
  } catch (error) {
    console.error('Protected template error:', error);
    return new NextResponse('Internal server error', {
      status: 500,
      headers: HOTLINK_PREVENTION_HEADERS,
    });
  }
}

/**
 * Block direct POST/PUT/DELETE requests
 */
export async function POST() {
  return new NextResponse('Method not allowed', { status: 405 });
}

export async function PUT() {
  return new NextResponse('Method not allowed', { status: 405 });
}

export async function DELETE() {
  return new NextResponse('Method not allowed', { status: 405 });
}
