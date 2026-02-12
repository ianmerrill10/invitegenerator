/**
 * Security utilities for input validation and sanitization
 */

// Allowed domains for image URLs (add your CDN/S3 domains here)
const ALLOWED_IMAGE_DOMAINS = [
  'invitegenerator-assets.s3.amazonaws.com',
  'invitegenerator-assets.s3.us-east-1.amazonaws.com',
  's3.amazonaws.com',
  's3.us-east-1.amazonaws.com',
  'images.unsplash.com',
  'cdn.invitegenerator.com',
  // Add more trusted domains as needed
];

// Private IP ranges that should never be accessed
const PRIVATE_IP_PATTERNS = [
  /^127\./,                          // Loopback
  /^10\./,                           // Private Class A
  /^172\.(1[6-9]|2[0-9]|3[01])\./,  // Private Class B
  /^192\.168\./,                     // Private Class C
  /^169\.254\./,                     // Link-local
  /^0\./,                            // Current network
  /^100\.(6[4-9]|[7-9][0-9]|1[0-2][0-7])\./,  // Carrier-grade NAT
  /^::1$/,                           // IPv6 loopback
  /^fc00:/i,                         // IPv6 unique local
  /^fe80:/i,                         // IPv6 link-local
  /^localhost$/i,                    // localhost hostname
  /^127\.0\.0\.1$/,                  // IPv4 loopback
  /^0\.0\.0\.0$/,                    // All interfaces
];

// Dangerous protocols that should never be allowed
const FORBIDDEN_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];

export interface URLValidationResult {
  valid: boolean;
  error?: string;
  sanitizedUrl?: string;
}

/**
 * Validates a URL for safe use (prevents SSRF attacks)
 * @param url The URL to validate
 * @param options Validation options
 */
export function validateURL(
  url: string,
  options: {
    requireHttps?: boolean;
    allowedDomains?: string[];
    maxLength?: number;
  } = {}
): URLValidationResult {
  const {
    requireHttps = true,
    allowedDomains = ALLOWED_IMAGE_DOMAINS,
    maxLength = 2048
  } = options;

  // Check length
  if (!url || url.length > maxLength) {
    return { valid: false, error: 'URL is too long or empty' };
  }

  // Check for forbidden protocols
  const lowerUrl = url.toLowerCase().trim();
  for (const protocol of FORBIDDEN_PROTOCOLS) {
    if (lowerUrl.startsWith(protocol)) {
      return { valid: false, error: 'Forbidden URL protocol' };
    }
  }

  // Parse URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  // Check protocol
  if (requireHttps && parsedUrl.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTPS URLs are allowed' };
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return { valid: false, error: 'Invalid URL protocol' };
  }

  // Check for private/internal IPs
  const hostname = parsedUrl.hostname.toLowerCase();
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return { valid: false, error: 'Internal/private URLs are not allowed' };
    }
  }

  // Check allowed domains if specified
  if (allowedDomains.length > 0) {
    const isAllowed = allowedDomains.some(domain => {
      const domainLower = domain.toLowerCase();
      return hostname === domainLower || hostname.endsWith('.' + domainLower);
    });

    if (!isAllowed) {
      return { valid: false, error: 'URL domain is not in the allowed list' };
    }
  }

  return {
    valid: true,
    sanitizedUrl: parsedUrl.href
  };
}

/**
 * Validates an image URL specifically
 * More restrictive than general URL validation
 */
export function validateImageURL(url: string): URLValidationResult {
  const result = validateURL(url, {
    requireHttps: true,
    allowedDomains: ALLOWED_IMAGE_DOMAINS,
    maxLength: 2048
  });

  if (!result.valid) {
    return result;
  }

  // Additional checks for image URLs
  // Optional file-extension checks could be added here, but we intentionally do not
  // enforce extensions since many CDNs use query params or omit them.

  return result;
}

/**
 * Validates an avatar URL with strict rules
 */
export function validateAvatarURL(url: string): URLValidationResult {
  // Allow null/empty - user might want to clear their avatar
  if (!url || url.trim() === '') {
    return { valid: true, sanitizedUrl: '' };
  }

  return validateImageURL(url);
}

/**
 * Sanitize user input to prevent XSS in non-HTML contexts
 * For HTML contexts, use DOMPurify instead
 */
export function sanitizeText(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .slice(0, maxLength)
    .replace(/[<>'"&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return entities[char] || char;
    });
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // RFC 5322 compliant regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain a special character');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

/**
 * Validate that a string is a valid UUID
 */
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Sanitize a filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'file';
  }

  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // Replace unsafe chars
    .replace(/\.{2,}/g, '.')           // Remove consecutive dots
    .replace(/^\.+|\.+$/g, '')         // Remove leading/trailing dots
    .slice(0, 255);                     // Limit length
}
