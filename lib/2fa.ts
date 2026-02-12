/**
 * Two-Factor Authentication Utilities
 *
 * Support for TOTP-based 2FA using authenticator apps
 */

import crypto from "crypto";

// Configuration
const ISSUER = "InviteGenerator";
const TOTP_PERIOD = 30; // seconds
const TOTP_DIGITS = 6;
const SECRET_LENGTH = 20; // bytes

/**
 * Generate a random base32 secret for TOTP
 */
export function generateSecret(): string {
  const buffer = crypto.randomBytes(SECRET_LENGTH);
  return base32Encode(buffer);
}

/**
 * Generate a TOTP URI for QR code generation
 */
export function generateTotpUri(email: string, secret: string): string {
  const encodedIssuer = encodeURIComponent(ISSUER);
  const encodedEmail = encodeURIComponent(email);

  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;
}

/**
 * Generate the current TOTP code
 */
export function generateTotp(secret: string, timestamp?: number): string {
  const time = timestamp || Date.now();
  const counter = Math.floor(time / 1000 / TOTP_PERIOD);

  return generateHotp(secret, counter);
}

/**
 * Verify a TOTP code
 * Allows for 1 period of clock skew in either direction
 */
export function verifyTotp(secret: string, code: string, window: number = 1): boolean {
  if (!code || code.length !== TOTP_DIGITS) {
    return false;
  }

  const time = Date.now();
  const counter = Math.floor(time / 1000 / TOTP_PERIOD);

  // Check current and adjacent time windows
  for (let i = -window; i <= window; i++) {
    const expectedCode = generateHotp(secret, counter + i);
    if (timingSafeEqual(code, expectedCode)) {
      return true;
    }
  }

  return false;
}

/**
 * Generate HOTP code
 */
function generateHotp(secret: string, counter: number): string {
  const decodedSecret = base32Decode(secret);
  const buffer = Buffer.alloc(8);

  // Write counter as big-endian 64-bit integer
  buffer.writeBigUInt64BE(BigInt(counter));

  // Generate HMAC-SHA1
  const hmac = crypto.createHmac("sha1", decodedSecret);
  hmac.update(buffer);
  const hash = hmac.digest();

  // Dynamic truncation
  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  // Generate 6-digit code
  const otp = binary % Math.pow(10, TOTP_DIGITS);
  return otp.toString().padStart(TOTP_DIGITS, "0");
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Base32 encoding (RFC 4648)
 */
const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buffer: Buffer): string {
  let result = "";
  let bits = 0;
  let value = 0;

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      result += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    result += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return result;
}

function base32Decode(encoded: string): Buffer {
  const cleanedInput = encoded.toUpperCase().replace(/[^A-Z2-7]/g, "");
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;

  for (const char of cleanedInput) {
    const index = BASE32_CHARS.indexOf(char);
    if (index === -1) continue;

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generate backup codes for account recovery
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    // Format: XXXX-XXXX
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }

  return codes;
}

/**
 * Hash a backup code for storage
 */
export function hashBackupCode(code: string): string {
  const normalized = code.replace(/-/g, "").toUpperCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Verify a backup code against stored hashes
 */
export function verifyBackupCode(code: string, hashedCodes: string[]): number {
  const hash = hashBackupCode(code);
  const index = hashedCodes.indexOf(hash);
  return index;
}

/**
 * 2FA setup response
 */
export interface TwoFactorSetup {
  secret: string;
  uri: string;
  backupCodes: string[];
  hashedBackupCodes: string[];
}

/**
 * Generate complete 2FA setup for a user
 */
export function setupTwoFactor(email: string): TwoFactorSetup {
  const secret = generateSecret();
  const uri = generateTotpUri(email, secret);
  const backupCodes = generateBackupCodes(10);
  const hashedBackupCodes = backupCodes.map(hashBackupCode);

  return {
    secret,
    uri,
    backupCodes,
    hashedBackupCodes,
  };
}

export default {
  generateSecret,
  generateTotpUri,
  generateTotp,
  verifyTotp,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
  setupTwoFactor,
};
