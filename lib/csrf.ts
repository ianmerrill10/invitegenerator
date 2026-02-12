/**
 * CSRF Protection Middleware
 *
 * Implements double-submit cookie pattern for CSRF protection.
 * - Generates a random token stored in a secure, httpOnly cookie
 * - Requires the token to be sent in a header on state-changing requests
 * - Validates that the header token matches the cookie token
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const CSRF_COOKIE_NAME = "__Host-csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";
const TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
  const array = new Uint8Array(TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * Get or create a CSRF token
 * Returns the token and whether it was newly created
 */
export async function getOrCreateCSRFToken(): Promise<{
  token: string;
  isNew: boolean;
}> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (existingToken && existingToken.length === TOKEN_LENGTH * 2) {
    return { token: existingToken, isNew: false };
  }

  const newToken = generateToken();
  return { token: newToken, isNew: true };
}

/**
 * Set the CSRF cookie on a response
 */
export function setCSRFCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

/**
 * Validate CSRF token from request
 * Returns true if valid, false otherwise
 */
export async function validateCSRFToken(request: NextRequest): Promise<{
  valid: boolean;
  error?: string;
}> {
  // Skip CSRF validation for safe methods
  const safeMethod = ["GET", "HEAD", "OPTIONS"].includes(request.method);
  if (safeMethod) {
    return { valid: true };
  }

  // Get token from cookie
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  if (!cookieToken) {
    return { valid: false, error: "Missing CSRF cookie" };
  }

  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (!headerToken) {
    return { valid: false, error: "Missing CSRF header" };
  }

  // Compare tokens using timing-safe comparison
  if (!timingSafeEqual(cookieToken, headerToken)) {
    return { valid: false, error: "CSRF token mismatch" };
  }

  return { valid: true };
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * CSRF protection middleware for API routes
 * Use this in your API route handlers to protect against CSRF attacks
 *
 * @example
 * export async function POST(request: NextRequest) {
 *   const csrfCheck = await validateCSRFToken(request);
 *   if (!csrfCheck.valid) {
 *     return NextResponse.json({ error: csrfCheck.error }, { status: 403 });
 *   }
 *   // ... rest of handler
 * }
 */
export async function csrfProtect(
  request: NextRequest
): Promise<{ error: NextResponse } | { error: null }> {
  const validation = await validateCSRFToken(request);

  if (!validation.valid) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: "CSRF_VALIDATION_FAILED",
            message: validation.error || "CSRF validation failed",
          },
        },
        { status: 403 }
      ),
    };
  }

  return { error: null };
}

/**
 * API endpoint to get a fresh CSRF token
 * Include this in your app to get tokens for client-side requests
 */
export async function GET() {
  const { token, isNew } = await getOrCreateCSRFToken();

  const response = NextResponse.json({ csrfToken: token });

  if (isNew) {
    setCSRFCookie(response, token);
  }

  return response;
}
