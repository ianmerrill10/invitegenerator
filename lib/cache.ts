/**
 * Caching Utilities
 *
 * Simple in-memory cache with TTL support for API responses
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set a value in cache with TTL
   */
  set<T>(key: string, value: T, ttlMs: number = 60000): void {
    // Evict oldest entries if at max size
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Delete a value from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Delete all entries matching a pattern
   */
  deletePattern(pattern: string): number {
    let deleted = 0;
    const regex = new RegExp(pattern);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    let cleaned = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get or set a value (cache-through pattern)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 60000
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    this.set(key, value, ttlMs);
    return value;
  }
}

// Global cache instance
export const cache = new MemoryCache();

// Cache key generators
export const cacheKeys = {
  user: (userId: string) => `user:${userId}`,
  invitation: (invitationId: string) => `invitation:${invitationId}`,
  invitations: (userId: string) => `invitations:${userId}`,
  template: (templateId: string) => `template:${templateId}`,
  templates: (category?: string) => `templates:${category || "all"}`,
  rsvps: (invitationId: string) => `rsvps:${invitationId}`,
  analytics: (invitationId: string) => `analytics:${invitationId}`,
  affiliate: (userId: string) => `affiliate:${userId}`,
  notifications: (userId: string) => `notifications:${userId}`,
};

// Cache TTL presets (in milliseconds)
export const cacheTTL = {
  short: 30 * 1000, // 30 seconds
  medium: 5 * 60 * 1000, // 5 minutes
  long: 30 * 60 * 1000, // 30 minutes
  hour: 60 * 60 * 1000, // 1 hour
  day: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Cache invalidation helpers
 */
export const invalidateCache = {
  user: (userId: string) => {
    cache.delete(cacheKeys.user(userId));
    cache.delete(cacheKeys.invitations(userId));
    cache.delete(cacheKeys.affiliate(userId));
    cache.delete(cacheKeys.notifications(userId));
  },

  invitation: (invitationId: string, userId?: string) => {
    cache.delete(cacheKeys.invitation(invitationId));
    cache.delete(cacheKeys.rsvps(invitationId));
    cache.delete(cacheKeys.analytics(invitationId));
    if (userId) {
      cache.delete(cacheKeys.invitations(userId));
    }
  },

  templates: () => {
    cache.deletePattern("^templates:");
  },

  all: () => {
    cache.clear();
  },
};

/**
 * Decorator for caching function results
 */
export function withCache<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttlMs: number = cacheTTL.medium
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    return cache.getOrSet(key, () => fn(...args) as Promise<Awaited<ReturnType<T>>>, ttlMs);
  }) as T;
}

/**
 * Request deduplication
 * Prevents multiple simultaneous requests for the same data
 */
const pendingRequests = new Map<string, Promise<unknown>>();

export async function deduplicatedFetch<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // Check if there's already a pending request for this key
  const pending = pendingRequests.get(key) as Promise<T> | undefined;
  if (pending) {
    return pending;
  }

  // Create new request
  const request = fetcher().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, request);
  return request;
}

// Cleanup expired entries periodically (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}

export default cache;
