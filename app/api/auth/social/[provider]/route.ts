/**
 * Social Login OAuth Handler
 *
 * Initiates OAuth flow for social providers:
 * - Google, Facebook, Apple, Twitter/X
 *
 * Uses AWS Cognito hosted UI or direct OAuth depending on provider.
 * Collects extended profile data for marketing database.
 */

import { NextRequest, NextResponse } from "next/server";

// Supported social providers
const PROVIDERS = {
  google: {
    name: "Google",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    scopes: ["openid", "email", "profile"],
    // Additional scopes for marketing data
    extendedScopes: ["https://www.googleapis.com/auth/user.birthday.read"],
  },
  facebook: {
    name: "Facebook",
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    scopes: ["email", "public_profile"],
    // Extended permissions for marketing
    extendedScopes: ["user_birthday", "user_location"],
  },
  apple: {
    name: "Apple",
    authUrl: "https://appleid.apple.com/auth/authorize",
    scopes: ["name", "email"],
    extendedScopes: [],
  },
  twitter: {
    name: "Twitter",
    authUrl: "https://twitter.com/i/oauth2/authorize",
    scopes: ["tweet.read", "users.read"],
    extendedScopes: ["follows.read"],
  },
} as const;

type Provider = keyof typeof PROVIDERS;

/**
 * GET: Initiate OAuth flow
 * Redirects user to provider's authorization page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  // Validate provider
  if (!PROVIDERS[provider as Provider]) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_PROVIDER",
          message: `Provider "${provider}" is not supported`
        }
      },
      { status: 400 }
    );
  }

  const providerConfig = PROVIDERS[provider as Provider];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth/social/${provider}/callback`;

  // Get client ID from environment
  const clientIdKey = `${provider.toUpperCase()}_CLIENT_ID`;
  const clientId = process.env[clientIdKey];

  if (!clientId) {
    console.error(`Missing ${clientIdKey} environment variable`);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CONFIG_ERROR",
          message: "Social login is not configured"
        }
      },
      { status: 500 }
    );
  }

  // Generate state for CSRF protection
  const state = crypto.randomUUID();

  // Store state in cookie for verification
  const response = NextResponse.redirect(buildAuthUrl(
    provider as Provider,
    clientId,
    redirectUri,
    state
  ));

  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  // Store return URL if provided
  const returnUrl = request.nextUrl.searchParams.get("returnUrl") || "/dashboard";
  response.cookies.set("oauth_return_url", returnUrl, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}

/**
 * Build OAuth authorization URL for provider
 */
function buildAuthUrl(
  provider: Provider,
  clientId: string,
  redirectUri: string,
  state: string
): string {
  const config = PROVIDERS[provider];
  const params = new URLSearchParams();

  switch (provider) {
    case "google":
      params.set("client_id", clientId);
      params.set("redirect_uri", redirectUri);
      params.set("response_type", "code");
      params.set("scope", [...config.scopes, ...config.extendedScopes].join(" "));
      params.set("state", state);
      params.set("access_type", "offline"); // Get refresh token
      params.set("prompt", "consent"); // Force consent screen for marketing data
      break;

    case "facebook":
      params.set("client_id", clientId);
      params.set("redirect_uri", redirectUri);
      params.set("response_type", "code");
      params.set("scope", [...config.scopes, ...config.extendedScopes].join(","));
      params.set("state", state);
      break;

    case "apple":
      params.set("client_id", clientId);
      params.set("redirect_uri", redirectUri);
      params.set("response_type", "code id_token");
      params.set("scope", config.scopes.join(" "));
      params.set("state", state);
      params.set("response_mode", "form_post");
      break;

    case "twitter":
      params.set("client_id", clientId);
      params.set("redirect_uri", redirectUri);
      params.set("response_type", "code");
      params.set("scope", [...config.scopes, ...config.extendedScopes].join(" "));
      params.set("state", state);
      params.set("code_challenge", state); // Simplified PKCE
      params.set("code_challenge_method", "plain");
      break;
  }

  return `${config.authUrl}?${params.toString()}`;
}
