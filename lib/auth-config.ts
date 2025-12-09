/**
 * Authentication Configuration
 *
 * Email whitelist can be configured via environment variables:
 * - ALLOWED_EMAILS: Comma-separated list of allowed email addresses
 * - ALLOW_ALL_EMAILS: Set to "true" to disable whitelist (for production launch)
 *
 * Fallback: If no environment variables are set, uses the hardcoded list below
 */

// Parse allowed emails from environment variable or use defaults
function getWhitelistedEmails(): string[] {
  // Check if all emails should be allowed (for production launch)
  if (process.env.ALLOW_ALL_EMAILS === "true") {
    return [];
  }

  // Check environment variable for comma-separated email list
  const envEmails = process.env.ALLOWED_EMAILS;
  if (envEmails) {
    return envEmails
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0);
  }

  // Default whitelist (beta mode)
  return [
    "ianmerrill10@gmail.com",
    // Add more emails here as needed during beta
  ];
}

export const AUTH_CONFIG = {
  // Get the list of allowed emails (lazily evaluated)
  get ALLOWED_EMAILS(): string[] {
    return getWhitelistedEmails();
  },

  // Check if whitelist is disabled (allow all emails)
  get isWhitelistDisabled(): boolean {
    return process.env.ALLOW_ALL_EMAILS === "true";
  },

  // Check if an email is allowed
  isEmailAllowed: (email: string): boolean => {
    // If whitelist is disabled, allow all emails
    if (AUTH_CONFIG.isWhitelistDisabled) {
      return true;
    }

    const allowedEmails = AUTH_CONFIG.ALLOWED_EMAILS;

    // If no emails in whitelist (shouldn't happen), deny access for safety
    if (allowedEmails.length === 0) {
      return false;
    }

    return allowedEmails.some(
      (allowed) => allowed.toLowerCase() === email.toLowerCase()
    );
  },
};
