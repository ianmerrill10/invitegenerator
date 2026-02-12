// ============================================
// RATE LIMITING MIDDLEWARE
// Simple in-memory rate limiter for API routes
// ============================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (for single-server deployment)
// For multi-server, use Redis
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export interface RateLimitConfig {
  maxRequests: number;  // Max requests allowed
  windowMs: number;     // Time window in milliseconds
  keyPrefix?: string;   // Optional prefix for the key
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Check rate limit for a given identifier
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = config.keyPrefix ? `${config.keyPrefix}:${identifier}` : identifier;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // If no entry or entry has expired, create new one
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  // If under limit, increment
  if (entry.count < config.maxRequests) {
    entry.count++;
    return {
      success: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  // Over limit
  return {
    success: false,
    remaining: 0,
    resetTime: entry.resetTime,
    retryAfter: Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * Reset rate limit for a given identifier
 */
export function resetRateLimit(identifier: string, keyPrefix?: string): void {
  const key = keyPrefix ? `${keyPrefix}:${identifier}` : identifier;
  rateLimitStore.delete(key);
}

// ==================== PRESET CONFIGURATIONS ====================

// General API rate limit
export const API_RATE_LIMIT: RateLimitConfig = {
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
  keyPrefix: "api",
};

// Auth endpoints (stricter)
export const AUTH_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60000, // 10 attempts per minute
  keyPrefix: "auth",
};

// AI endpoints (stricter due to cost)
export const AI_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 20,
  windowMs: 60000, // 20 requests per minute
  keyPrefix: "ai",
};

// Upload endpoints
export const UPLOAD_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 30,
  windowMs: 60000, // 30 uploads per minute
  keyPrefix: "upload",
};

// Public RSVP submissions (stricter to prevent abuse)
export const PUBLIC_RSVP_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 300000, // 10 submissions per 5 minutes
  keyPrefix: "rsvp",
};

// Public invitation views
export const PUBLIC_VIEW_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60000, // 100 views per minute
  keyPrefix: "view",
};

// Password reset (very strict to prevent abuse)
export const PASSWORD_RESET_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 3,
  windowMs: 3600000, // 3 attempts per hour
  keyPrefix: "pwd-reset",
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  // Check various headers for the real IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback to a default
  return "unknown";
}

/**
 * Create rate limit response headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.resetTime.toString(),
    ...(result.retryAfter && { "Retry-After": result.retryAfter.toString() }),
  };
}

/**
 * Apply rate limiting to a request
 * Returns null if allowed, or an error response if rate limited
 */
export function applyRateLimit(
  request: Request,
  config: RateLimitConfig = API_RATE_LIMIT
): { headers: Record<string, string>; error?: { status: number; message: string } } {
  const ip = getClientIP(request);
  const result = checkRateLimit(ip, config);
  const headers = getRateLimitHeaders(result);

  if (!result.success) {
    return {
      headers,
      error: {
        status: 429,
        message: `Too many requests. Please try again in ${result.retryAfter} seconds.`,
      },
    };
  }

  return { headers };
}
