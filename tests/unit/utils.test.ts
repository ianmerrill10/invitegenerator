import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  cn,
  formatDate,
  formatRelativeDate,
  formatEventDateTime,
  getDaysUntilEvent,
  isEventPast,
  isRSVPDeadlinePast,
  capitalize,
  toTitleCase,
  truncate,
  slugify,
  formatEventType,
  formatNumber,
  formatCurrency,
  formatPercent,
  clamp,
  isValidEmail,
  validatePassword,
  isValidUrl,
  getInvitationShareUrl,
  getRSVPUrl,
  getGoogleMapsUrl,
  getAddToCalendarUrl,
  unique,
  groupBy,
  sortBy,
  hexToRgb,
  isLightColor,
  getContrastColor,
  generateId,
  randomColor,
  randomItem,
} from '@/lib/utils';

// ============================================
// CLASS NAME UTILITIES
// ============================================
describe('cn (class names)', () => {
  it('combines multiple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('merges Tailwind classes correctly', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });
});

// ============================================
// DATE UTILITIES
// ============================================
describe('formatDate', () => {
  it('formats ISO date string', () => {
    const result = formatDate('2024-12-25');
    expect(result).toContain('December');
    expect(result).toContain('25');
    expect(result).toContain('2024');
  });

  it('formats Date object', () => {
    const result = formatDate(new Date('2024-12-25'));
    expect(result).toContain('December');
  });

  it('handles custom format', () => {
    const result = formatDate('2024-12-25', 'yyyy-MM-dd');
    expect(result).toBe('2024-12-25');
  });

  it('returns "Invalid date" for invalid input', () => {
    expect(formatDate('invalid')).toBe('Invalid date');
  });
});

describe('formatRelativeDate', () => {
  it('returns relative time string', () => {
    const recentDate = new Date(Date.now() - 60000).toISOString(); // 1 minute ago
    const result = formatRelativeDate(recentDate);
    expect(result).toContain('ago');
  });

  it('handles invalid date', () => {
    expect(formatRelativeDate('invalid')).toBe('Invalid date');
  });
});

describe('formatEventDateTime', () => {
  it('formats date without time', () => {
    const result = formatEventDateTime('2024-12-25');
    expect(result).toContain('December');
    expect(result).toContain('25');
  });

  it('formats date with time', () => {
    const result = formatEventDateTime('2024-12-25', '14:00');
    expect(result).toContain('at 14:00');
  });
});

describe('getDaysUntilEvent', () => {
  it('returns positive days for future event', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const result = getDaysUntilEvent(futureDate.toISOString().split('T')[0]);
    expect(result).toBeGreaterThanOrEqual(9);
    expect(result).toBeLessThanOrEqual(10);
  });

  it('returns negative days for past event', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);
    const result = getDaysUntilEvent(pastDate.toISOString().split('T')[0]);
    expect(result).toBeLessThan(0);
  });

  it('returns 0 for invalid date', () => {
    expect(getDaysUntilEvent('invalid')).toBe(0);
  });
});

describe('isEventPast', () => {
  it('returns true for past date', () => {
    expect(isEventPast('2020-01-01')).toBe(true);
  });

  it('returns false for future date', () => {
    expect(isEventPast('2030-01-01')).toBe(false);
  });

  it('returns false for invalid date', () => {
    expect(isEventPast('invalid')).toBe(false);
  });
});

describe('isRSVPDeadlinePast', () => {
  it('returns false when no deadline', () => {
    expect(isRSVPDeadlinePast(undefined)).toBe(false);
  });

  it('returns true for past deadline', () => {
    expect(isRSVPDeadlinePast('2020-01-01')).toBe(true);
  });

  it('returns false for future deadline', () => {
    expect(isRSVPDeadlinePast('2030-01-01')).toBe(false);
  });
});

// ============================================
// STRING UTILITIES
// ============================================
describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('handles empty string', () => {
    expect(capitalize('')).toBe('');
  });

  it('handles single character', () => {
    expect(capitalize('a')).toBe('A');
  });
});

describe('toTitleCase', () => {
  it('converts string to title case', () => {
    expect(toTitleCase('hello world')).toBe('Hello World');
  });

  it('handles already uppercase', () => {
    expect(toTitleCase('HELLO WORLD')).toBe('Hello World');
  });

  it('handles empty string', () => {
    expect(toTitleCase('')).toBe('');
  });
});

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });

  it('does not truncate short strings', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('handles exact length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('handles empty string', () => {
    expect(truncate('', 10)).toBe('');
  });
});

describe('slugify', () => {
  it('converts string to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('handles multiple spaces', () => {
    expect(slugify('hello   world')).toBe('hello-world');
  });

  it('trims leading/trailing hyphens', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
  });
});

describe('formatEventType', () => {
  it('formats underscore-separated event type', () => {
    expect(formatEventType('birthday_party')).toBe('Birthday Party');
  });

  it('handles single word', () => {
    expect(formatEventType('wedding')).toBe('Wedding');
  });
});

// ============================================
// NUMBER UTILITIES
// ============================================
describe('formatNumber', () => {
  it('formats number with commas', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('handles small numbers', () => {
    expect(formatNumber(123)).toBe('123');
  });
});

describe('formatCurrency', () => {
  it('formats as USD by default', () => {
    const result = formatCurrency(99.99);
    expect(result).toBe('$99.99');
  });

  it('handles different currencies', () => {
    const result = formatCurrency(99.99, 'EUR');
    expect(result).toContain('99.99');
  });
});

describe('formatPercent', () => {
  it('formats decimal as percentage', () => {
    expect(formatPercent(0.5)).toBe('50%');
  });

  it('handles decimal places', () => {
    expect(formatPercent(0.333, 1)).toBe('33.3%');
  });
});

describe('clamp', () => {
  it('clamps value below min', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps value above max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('returns value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
});

// ============================================
// VALIDATION UTILITIES
// ============================================
describe('isValidEmail', () => {
  it('validates correct email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  it('rejects email without @', () => {
    expect(isValidEmail('testexample.com')).toBe(false);
  });

  it('rejects email without domain', () => {
    expect(isValidEmail('test@')).toBe(false);
  });

  it('rejects email with spaces', () => {
    expect(isValidEmail('test @example.com')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('validates strong password', () => {
    const result = validatePassword('StrongPass1');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects short password', () => {
    const result = validatePassword('Short1');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters');
  });

  it('rejects password without uppercase', () => {
    const result = validatePassword('lowercase1');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one uppercase letter');
  });

  it('rejects password without lowercase', () => {
    const result = validatePassword('UPPERCASE1');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one lowercase letter');
  });

  it('rejects password without number', () => {
    const result = validatePassword('NoNumbers');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one number');
  });
});

describe('isValidUrl', () => {
  it('validates correct URL', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
  });

  it('validates URL with path', () => {
    expect(isValidUrl('https://example.com/path/to/page')).toBe(true);
  });

  it('rejects invalid URL', () => {
    expect(isValidUrl('not a url')).toBe(false);
  });
});

// ============================================
// URL UTILITIES
// ============================================
describe('getInvitationShareUrl', () => {
  it('generates correct share URL', () => {
    const result = getInvitationShareUrl('abc123');
    expect(result).toBe('https://test.invitegenerator.com/i/abc123');
  });
});

describe('getRSVPUrl', () => {
  it('generates correct RSVP URL', () => {
    const result = getRSVPUrl('abc123');
    expect(result).toBe('https://test.invitegenerator.com/rsvp/abc123');
  });
});

describe('getGoogleMapsUrl', () => {
  it('generates correct Google Maps URL', () => {
    const result = getGoogleMapsUrl('123 Main St, City');
    expect(result).toContain('google.com/maps');
    expect(result).toContain('123%20Main%20St');
  });
});

describe('getAddToCalendarUrl', () => {
  it('generates Google Calendar URL', () => {
    const result = getAddToCalendarUrl({
      title: 'My Event',
      date: '2024-12-25',
      time: '14:00',
      location: 'New York',
      description: 'A great event',
    });
    expect(result).toContain('calendar.google.com');
    // URLSearchParams uses + for spaces instead of %20
    expect(result).toMatch(/My(\+|%20)Event/);
  });
});

// ============================================
// ARRAY UTILITIES
// ============================================
describe('unique', () => {
  it('removes duplicates', () => {
    expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
  });

  it('handles empty array', () => {
    expect(unique([])).toEqual([]);
  });

  it('handles strings', () => {
    expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b']);
  });
});

describe('groupBy', () => {
  it('groups items by key', () => {
    const items = [
      { category: 'a', value: 1 },
      { category: 'b', value: 2 },
      { category: 'a', value: 3 },
    ];
    const result = groupBy(items, 'category');
    expect(result['a']).toHaveLength(2);
    expect(result['b']).toHaveLength(1);
  });
});

describe('sortBy', () => {
  it('sorts ascending by default', () => {
    const items = [{ value: 3 }, { value: 1 }, { value: 2 }];
    const result = sortBy(items, 'value');
    expect(result.map((i) => i.value)).toEqual([1, 2, 3]);
  });

  it('sorts descending when specified', () => {
    const items = [{ value: 3 }, { value: 1 }, { value: 2 }];
    const result = sortBy(items, 'value', 'desc');
    expect(result.map((i) => i.value)).toEqual([3, 2, 1]);
  });
});

// ============================================
// COLOR UTILITIES
// ============================================
describe('hexToRgb', () => {
  it('converts hex to RGB', () => {
    expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('handles lowercase hex', () => {
    expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('handles hex without #', () => {
    expect(hexToRgb('0000FF')).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('returns null for invalid hex', () => {
    expect(hexToRgb('invalid')).toBeNull();
  });
});

describe('isLightColor', () => {
  it('identifies white as light', () => {
    expect(isLightColor('#FFFFFF')).toBe(true);
  });

  it('identifies black as dark', () => {
    expect(isLightColor('#000000')).toBe(false);
  });

  it('identifies yellow as light', () => {
    expect(isLightColor('#FFFF00')).toBe(true);
  });
});

describe('getContrastColor', () => {
  it('returns black for light background', () => {
    expect(getContrastColor('#FFFFFF')).toBe('#000000');
  });

  it('returns white for dark background', () => {
    expect(getContrastColor('#000000')).toBe('#FFFFFF');
  });
});

// ============================================
// RANDOM UTILITIES
// ============================================
describe('generateId', () => {
  it('generates ID of default length', () => {
    const id = generateId();
    expect(id).toHaveLength(12);
  });

  it('generates ID of specified length', () => {
    const id = generateId(8);
    expect(id).toHaveLength(8);
  });

  it('generates alphanumeric characters only', () => {
    const id = generateId(100);
    expect(id).toMatch(/^[A-Za-z0-9]+$/);
  });
});

describe('randomColor', () => {
  it('returns valid hex color', () => {
    const color = randomColor();
    expect(color).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe('randomItem', () => {
  it('returns item from array', () => {
    const arr = [1, 2, 3, 4, 5];
    const item = randomItem(arr);
    expect(arr).toContain(item);
  });
});
