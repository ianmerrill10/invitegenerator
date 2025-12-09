/**
 * Rate Limiting Utility
 *
 * Simple in-memory rate limiter for API routes.
 * For production at scale, consider using Redis or a distributed cache.
 */

import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// In production, use Redis or another distributed store
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 60000; // 1 minute
let lastCleanup = Date.now();

function cleanupExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Custom key generator (defaults to IP address) */
  keyGenerator?: (request: NextRequest) => string;
  /** Custom response when rate limited */
  message?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  // Try various headers in order of preference
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback to a generic identifier
  return "unknown";
}

/**
 * Check if request is rate limited
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): RateLimitResult {
  cleanupExpiredEntries();

  const key = config.keyGenerator
    ? config.keyGenerator(request)
    : getClientIP(request);

  const now = Date.now();
  const windowStart = now - config.windowMs;

  let entry = rateLimitStore.get(key);

  // If no entry or entry has expired, create new one
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  // Check if rate limited
  if (entry.count > config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limit response with proper headers
 */
export function rateLimitResponse(
  result: RateLimitResult,
  message?: string
): NextResponse {
  const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: message || "Too many requests. Please try again later.",
        retryAfter,
      },
    },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.resetTime.toString(),
        "Retry-After": retryAfter.toString(),
      },
    }
  );
}

/**
 * Higher-order function to wrap API handlers with rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>,
  config: RateLimitConfig
) {
  return async (request: NextRequest, ...args: unknown[]): Promise<NextResponse> => {
    const result = checkRateLimit(request, config);

    if (!result.success) {
      return rateLimitResponse(result, config.message);
    }

    const response = await handler(request, ...args);

    // Add rate limit headers to successful responses
    response.headers.set("X-RateLimit-Limit", result.limit.toString());
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set("X-RateLimit-Reset", result.resetTime.toString());

    return response;
  };
}

// Pre-configured rate limiters for common use cases
export const rateLimiters = {
  /** Strict rate limit for authentication endpoints */
  auth: {
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Too many authentication attempts. Please try again in 15 minutes.",
  } as RateLimitConfig,

  /** Standard API rate limit */
  api: {
    limit: 100,
    windowMs: 60 * 1000, // 1 minute
    message: "API rate limit exceeded. Please slow down your requests.",
  } as RateLimitConfig,

  /** Rate limit for AI/expensive operations */
  ai: {
    limit: 10,
    windowMs: 60 * 1000, // 1 minute
    message: "AI generation rate limit exceeded. Please try again in a minute.",
  } as RateLimitConfig,

  /** Rate limit for public RSVP submissions */
  rsvp: {
    limit: 10,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many RSVP submissions. Please try again later.",
  } as RateLimitConfig,
};
