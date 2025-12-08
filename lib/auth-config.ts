/**
 * Authentication Configuration
 *
 * ALLOWED_EMAILS: Only these emails can access the app
 * Add more emails to the array to allow more users
 */

export const AUTH_CONFIG = {
  // Only these emails can log in
  ALLOWED_EMAILS: [
    "ianmerrll10@gmail.com",
    // Add more emails here as needed:
    // "another@email.com",
  ],

  // Check if an email is allowed
  isEmailAllowed: (email: string): boolean => {
    return AUTH_CONFIG.ALLOWED_EMAILS.some(
      (allowed) => allowed.toLowerCase() === email.toLowerCase()
    );
  },
};
