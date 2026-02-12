import {
  checkRateLimit,
  resetRateLimit,
  API_RATE_LIMIT,
  AUTH_RATE_LIMIT,
} from '@/lib/rate-limit';

describe('Rate Limiting', () => {
  const testIdentifier = 'test-user-123';

  beforeEach(() => {
    resetRateLimit(testIdentifier, API_RATE_LIMIT.keyPrefix);
    resetRateLimit(testIdentifier, AUTH_RATE_LIMIT.keyPrefix);
  });

  describe('checkRateLimit', () => {
    it('should allow requests under the limit', () => {
      const config = { maxRequests: 5, windowMs: 60000, keyPrefix: 'test' };

      const result1 = checkRateLimit(testIdentifier, config);
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(4);

      const result2 = checkRateLimit(testIdentifier, config);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(3);
    });

    it('should block requests over the limit', () => {
      const config = { maxRequests: 2, windowMs: 60000, keyPrefix: 'test2' };

      checkRateLimit(testIdentifier, config);
      checkRateLimit(testIdentifier, config);

      const result = checkRateLimit(testIdentifier, config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeDefined();
    });

    it('should reset after window expires', async () => {
      const config = { maxRequests: 1, windowMs: 100, keyPrefix: 'test3' };

      checkRateLimit(testIdentifier, config);

      const blockedResult = checkRateLimit(testIdentifier, config);
      expect(blockedResult.success).toBe(false);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      const newResult = checkRateLimit(testIdentifier, config);
      expect(newResult.success).toBe(true);
    });
  });

  describe('resetRateLimit', () => {
    it('should reset the rate limit for an identifier', () => {
      const config = { maxRequests: 1, windowMs: 60000, keyPrefix: 'test4' };

      checkRateLimit(testIdentifier, config);

      const blockedResult = checkRateLimit(testIdentifier, config);
      expect(blockedResult.success).toBe(false);

      resetRateLimit(testIdentifier, 'test4');

      const resetResult = checkRateLimit(testIdentifier, config);
      expect(resetResult.success).toBe(true);
    });
  });
});
