import {
  cn,
  formatDate,
  formatRelativeDate,
  isValidEmail,
  isValidPhone,
  slugify,
  truncate,
  formatCurrency,
} from '@/lib/utils';

describe('Utils', () => {
  describe('cn (classNames)', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('should merge tailwind classes correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });
  });

  describe('formatDate', () => {
    it('should format date with default format', () => {
      const date = new Date('2024-03-15T10:30:00');
      const result = formatDate(date.toISOString());
      expect(result).toBeTruthy();
    });

    it('should format date with custom format', () => {
      const date = new Date('2024-03-15');
      const result = formatDate(date.toISOString(), 'yyyy-MM-dd');
      expect(result).toBe('2024-03-15');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.org')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('123-456-7890')).toBe(true);
      expect(isValidPhone('(123) 456-7890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abcdefghij')).toBe(false);
    });
  });

  describe('slugify', () => {
    it('should create URL-friendly slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Wedding Invitation 2024!')).toBe('wedding-invitation-2024');
    });

    it('should handle special characters', () => {
      expect(slugify('Test & Example')).toBe('test-example');
      expect(slugify('Multiple   Spaces')).toBe('multiple-spaces');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...');
    });

    it('should not truncate short strings', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency values', () => {
      expect(formatCurrency(1000)).toContain('1,000');
      expect(formatCurrency(99.99)).toContain('99.99');
    });
  });
});
