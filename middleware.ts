import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Site password protection - set SITE_PASSWORD env var to enable
const SITE_PASSWORD = process.env.SITE_PASSWORD;
const PASSWORD_COOKIE_NAME = 'site_access_granted';

// CSRF token generation
function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window

// Simple in-memory rate limiter (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return `${ip}:${request.nextUrl.pathname}`;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record) {
    rateLimitMap.set(key, { count: 1, timestamp: now });
    return false;
  }

  if (now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { count: 1, timestamp: now });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  record.count++;
  return false;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now - record.timestamp > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW);

export function middleware(request: NextRequest) {
  // Password protection check
  if (SITE_PASSWORD) {
    const pathname = request.nextUrl.pathname;

    // Skip password protection for these paths
    const skipPasswordPaths = [
      '/site-access',
      '/api/site-access',
      '/api/webhooks/',
      '/api/health',
      '/api/auth/',
      '/api/rsvp/',
      '/api/public/',
      '/api/og',
      '/_next',
      '/favicon.ico',
      '/icon.svg',
      '/robots.txt',
      '/sitemap.xml',
    ];

    const shouldSkipPassword = skipPasswordPaths.some(path => pathname.startsWith(path));

    if (!shouldSkipPassword) {
      const accessCookie = request.cookies.get(PASSWORD_COOKIE_NAME);

      if (!accessCookie || accessCookie.value !== SITE_PASSWORD) {
        // Redirect to password page
        const url = request.nextUrl.clone();
        url.pathname = '/site-access';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
    }
  }

  const response = NextResponse.next();

  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const rateLimitKey = getRateLimitKey(request);

    if (isRateLimited(rateLimitKey)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }

    // Add rate limit headers
    const record = rateLimitMap.get(rateLimitKey);
    if (record) {
      response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS));
      response.headers.set('X-RateLimit-Remaining', String(RATE_LIMIT_MAX_REQUESTS - record.count));
      response.headers.set('X-RateLimit-Reset', String(Math.ceil((record.timestamp + RATE_LIMIT_WINDOW) / 1000)));
    }

    // CSRF validation for state-changing requests
    const method = request.method.toUpperCase();
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const csrfHeader = request.headers.get('x-csrf-token');
      const csrfCookie = request.cookies.get('csrf-token')?.value;

      // Skip CSRF for authentication endpoints and external webhooks
      const skipCSRF = [
        '/api/auth/login',
        '/api/auth/signup',
        '/api/auth/refresh',
        '/api/webhooks/stripe',
        '/api/webhooks/prodigi',
        '/api/rsvp',
        '/api/site-access',
      ].some(
        path => request.nextUrl.pathname.startsWith(path)
      );

      if (!skipCSRF && (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie)) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid CSRF token' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }
  }

  // Set CSRF token cookie if not present
  if (!request.cookies.get('csrf-token')) {
    const csrfToken = generateCSRFToken();
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: false, // Must be readable by JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  // Security headers for all requests
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Remove server header
  response.headers.delete('X-Powered-By');

  return response;
}

export const config = {
  matcher: [
    // Match all request paths except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
