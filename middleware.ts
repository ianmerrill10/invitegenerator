import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security Middleware
 *
 * Generates CSP nonces for inline scripts and applies security headers.
 * This replaces unsafe-inline with proper nonce-based CSP.
 */
export function middleware(request: NextRequest) {
  // Generate a random nonce for this request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  // Build Content-Security-Policy with nonce
  const cspHeader = [
    "default-src 'self'",
    // Scripts: use nonce and strict-dynamic for inline scripts
    // Keep unsafe-eval for development (Next.js HMR requires it)
    `script-src 'self' 'nonce-${nonce}' https://js.stripe.com${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
    // Styles: need unsafe-inline for Tailwind and component libraries
    // This is a known limitation - CSS nonces are complex with dynamic styles
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    // Images
    "img-src 'self' blob: data: https://*.amazonaws.com https://*.stripe.com",
    // Fonts
    "font-src 'self' https://fonts.gstatic.com",
    // Connections/XHR/fetch
    "connect-src 'self' https://*.amazonaws.com https://api.stripe.com https://cognito-idp.*.amazonaws.com",
    // Frames (for Stripe)
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    // Disable object embedding
    "object-src 'none'",
    // Base URI restriction
    "base-uri 'self'",
    // Form actions
    "form-action 'self'",
    // Frame ancestors (prevent clickjacking)
    "frame-ancestors 'self'",
    // Upgrade HTTP to HTTPS
    "upgrade-insecure-requests",
  ].join('; ');

  // Clone the response and add headers
  const response = NextResponse.next();

  // Set CSP header
  response.headers.set('Content-Security-Policy', cspHeader);

  // Set the nonce in a custom header so pages can access it
  response.headers.set('x-nonce', nonce);

  // Additional security headers (these supplement next.config.js headers)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  return response;
}

// Match all paths except static files and api routes that need different handling
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - they set their own headers)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
