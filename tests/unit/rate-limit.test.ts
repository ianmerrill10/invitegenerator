import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  checkRateLimit,
  rateLimitResponse,
  getClientIP,
  rateLimiters,
  type RateLimitConfig,
} from '@/lib/rate-limit';

// Helper to create mock NextRequest
function createMockRequest(ip: string = '127.0.0.1'): NextRequest {
  const headers = new Headers();
  headers.set('x-forwarded-for', ip);

  return {
    headers,
    url: 'https://example.com/api/test',
  } as unknown as NextRequest;
}

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Reset the rate limit store between tests by waiting
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getClientIP', () => {
    it('extracts IP from x-forwarded-for header', () => {
      const request = createMockRequest('192.168.1.1');
      expect(getClientIP(request)).toBe('192.168.1.1');
    });

    it('handles multiple IPs in x-forwarded-for', () => {
      const headers = new Headers();
      headers.set('x-forwarded-for', '192.168.1.1, 10.0.0.1, 172.16.0.1');
      const request = { headers } as unknown as NextRequest;
      expect(getClientIP(request)).toBe('192.168.1.1');
    });

    it('falls back to x-real-ip', () => {
      const headers = new Headers();
      headers.set('x-real-ip', '10.0.0.1');
      const request = { headers } as unknown as NextRequest;
      expect(getClientIP(request)).toBe('10.0.0.1');
    });

    it('returns "unknown" when no IP headers', () => {
      const headers = new Headers();
      const request = { headers } as unknown as NextRequest;
      expect(getClientIP(request)).toBe('unknown');
    });
  });

  describe('checkRateLimit', () => {
    const config: RateLimitConfig = {
      limit: 3,
      windowMs: 60000, // 1 minute
    };

    it('allows requests under the limit', () => {
      const request = createMockRequest('test-ip-1');

      const result1 = checkRateLimit(request, config);
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(2);

      const result2 = checkRateLimit(request, config);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(1);

      const result3 = checkRateLimit(request, config);
      expect(result3.success).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('blocks requests over the limit', () => {
      const request = createMockRequest('test-ip-2');

      // Make 3 requests (at limit)
      checkRateLimit(request, config);
      checkRateLimit(request, config);
      checkRateLimit(request, config);

      // 4th request should be blocked
      const result = checkRateLimit(request, config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('resets after window expires', () => {
      const request = createMockRequest('test-ip-3');

      // Use up all requests
      checkRateLimit(request, config);
      checkRateLimit(request, config);
      checkRateLimit(request, config);
      checkRateLimit(request, config); // This should fail

      // Advance time past the window
      vi.advanceTimersByTime(61000);

      // Should be able to make requests again
      const result = checkRateLimit(request, config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('tracks different IPs separately', () => {
      const request1 = createMockRequest('ip-a');
      const request2 = createMockRequest('ip-b');

      // Use up all requests for IP A
      checkRateLimit(request1, config);
      checkRateLimit(request1, config);
      checkRateLimit(request1, config);
      const blocked = checkRateLimit(request1, config);
      expect(blocked.success).toBe(false);

      // IP B should still be able to make requests
      const result = checkRateLimit(request2, config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('supports custom key generator', () => {
      const customConfig: RateLimitConfig = {
        limit: 2,
        windowMs: 60000,
        keyGenerator: () => 'custom-key',
      };

      const request1 = createMockRequest('ip-x');
      const request2 = createMockRequest('ip-y');

      // Both requests should use the same key
      checkRateLimit(request1, customConfig);
      checkRateLimit(request2, customConfig);

      const result = checkRateLimit(request1, customConfig);
      expect(result.success).toBe(false);
    });
  });

  describe('rateLimitResponse', () => {
    it('returns 429 status', () => {
      const result = {
        success: false,
        limit: 5,
        remaining: 0,
        resetTime: Date.now() + 60000,
      };

      const response = rateLimitResponse(result);
      expect(response.status).toBe(429);
    });

    it('includes rate limit headers', () => {
      const result = {
        success: false,
        limit: 5,
        remaining: 0,
        resetTime: Date.now() + 60000,
      };

      const response = rateLimitResponse(result);
      expect(response.headers.get('X-RateLimit-Limit')).toBe('5');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(response.headers.get('Retry-After')).toBeTruthy();
    });

    it('uses custom message when provided', async () => {
      const result = {
        success: false,
        limit: 5,
        remaining: 0,
        resetTime: Date.now() + 60000,
      };

      const response = rateLimitResponse(result, 'Custom rate limit message');
      const body = await response.json();
      expect(body.error.message).toBe('Custom rate limit message');
    });
  });

  describe('Pre-configured rate limiters', () => {
    it('has auth rate limiter configured', () => {
      expect(rateLimiters.auth).toBeDefined();
      expect(rateLimiters.auth.limit).toBe(5);
      expect(rateLimiters.auth.windowMs).toBe(15 * 60 * 1000);
    });

    it('has api rate limiter configured', () => {
      expect(rateLimiters.api).toBeDefined();
      expect(rateLimiters.api.limit).toBe(100);
      expect(rateLimiters.api.windowMs).toBe(60 * 1000);
    });

    it('has ai rate limiter configured', () => {
      expect(rateLimiters.ai).toBeDefined();
      expect(rateLimiters.ai.limit).toBe(10);
      expect(rateLimiters.ai.windowMs).toBe(60 * 1000);
    });

    it('has rsvp rate limiter configured', () => {
      expect(rateLimiters.rsvp).toBeDefined();
      expect(rateLimiters.rsvp.limit).toBe(10);
      expect(rateLimiters.rsvp.windowMs).toBe(60 * 1000);
    });
  });
});
