import { z } from "zod";

/**
 * Server-side environment variables schema
 * These are only available on the server
 */
const serverEnvSchema = z.object({
  // AWS Configuration
  AWS_REGION: z.string().default("us-east-1"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),

  // DynamoDB Tables
  DYNAMODB_USERS_TABLE: z.string().default("InviteGenerator-Users-production"),
  DYNAMODB_INVITATIONS_TABLE: z.string().default("InviteGenerator-Invitations-production"),
  DYNAMODB_RSVPS_TABLE: z.string().default("InviteGenerator-RSVPs-production"),

  // Cognito
  COGNITO_USER_POOL_ID: z.string().optional(),
  COGNITO_CLIENT_ID: z.string().optional(),
  COGNITO_CLIENT_SECRET: z.string().optional(),

  // S3
  S3_BUCKET_NAME: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Email
  SES_FROM_EMAIL: z.string().email().optional(),

  // Security
  CSRF_SECRET: z.string().min(32).optional(),

  // Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

/**
 * Client-side environment variables schema
 * These are exposed to the browser (NEXT_PUBLIC_ prefix)
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("https://invitegenerator.com"),
  NEXT_PUBLIC_APP_NAME: z.string().default("InviteGenerator"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
});

/**
 * Validate and parse server environment variables
 */
function validateServerEnv() {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("Invalid server environment variables:");
    console.error(parsed.error.flatten().fieldErrors);

    // In development, warn but don't crash
    if (process.env.NODE_ENV === "development") {
      console.warn("Using default values for missing environment variables");
      return serverEnvSchema.parse({});
    }

    throw new Error("Invalid server environment variables");
  }

  return parsed.data;
}

/**
 * Validate and parse client environment variables
 */
function validateClientEnv() {
  const clientEnv = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  };

  const parsed = clientEnvSchema.safeParse(clientEnv);

  if (!parsed.success) {
    console.error("Invalid client environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    return clientEnvSchema.parse({});
  }

  return parsed.data;
}

// Export validated environment variables
export const serverEnv = validateServerEnv();
export const clientEnv = validateClientEnv();

// Type exports
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
