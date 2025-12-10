/**
 * Cache Utilities
 *
 * Simple caching utilities for API routes and data fetching.
 * Uses in-memory cache with TTL for serverless environments.
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

// In-memory cache store
const cache = new Map<string, CacheEntry<unknown>>();

// Cleanup interval (5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

/**
 * Clean up expired cache entries
 */
function cleanupExpired(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, entry] of cache.entries()) {
    if (entry.expiry < now) {
      cache.delete(key);
    }
  }
}

/**
 * Get cached value
 */
export function getCached<T>(key: string): T | null {
  cleanupExpired();

  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  if (entry.expiry < Date.now()) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Set cached value with TTL
 */
export function setCached<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlMs,
  });
}

/**
 * Delete cached value
 */
export function deleteCached(key: string): void {
  cache.delete(key);
}

/**
 * Delete cached values matching a prefix
 */
export function deleteCachedByPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

/**
 * Cached fetch wrapper with stale-while-revalidate pattern
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    /** Fresh data TTL in milliseconds */
    ttl: number;
    /** Stale data TTL (can serve stale while revalidating) */
    staleTtl?: number;
  }
): Promise<T> {
  const { ttl, staleTtl = ttl * 2 } = options;

  // Check cache
  const cached = getCached<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();
  setCached(key, data, ttl);

  return data;
}

/**
 * Cache keys for common resources
 */
export const CacheKeys = {
  templates: (category?: string) => `templates:${category || 'all'}`,
  invitation: (id: string) => `invitation:${id}`,
  user: (id: string) => `user:${id}`,
  rsvpSummary: (invitationId: string) => `rsvp:summary:${invitationId}`,
};

/**
 * Standard TTL values
 */
export const CacheTTL = {
  /** Short cache for dynamic data (1 minute) */
  SHORT: 60 * 1000,
  /** Medium cache for semi-static data (5 minutes) */
  MEDIUM: 5 * 60 * 1000,
  /** Long cache for static data (1 hour) */
  LONG: 60 * 60 * 1000,
  /** Extended cache for rarely changing data (24 hours) */
  EXTENDED: 24 * 60 * 60 * 1000,
};

/**
 * Generate Cache-Control header value
 */
export function getCacheControlHeader(options: {
  maxAge: number;
  staleWhileRevalidate?: number;
  private?: boolean;
  noStore?: boolean;
}): string {
  const parts: string[] = [];

  if (options.noStore) {
    return 'no-store, no-cache, must-revalidate';
  }

  parts.push(options.private ? 'private' : 'public');
  parts.push(`max-age=${Math.floor(options.maxAge / 1000)}`);

  if (options.staleWhileRevalidate) {
    parts.push(`stale-while-revalidate=${Math.floor(options.staleWhileRevalidate / 1000)}`);
  }

  return parts.join(', ');
}
