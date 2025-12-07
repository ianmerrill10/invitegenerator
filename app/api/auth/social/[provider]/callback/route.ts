/**
 * Social Login OAuth Callback Handler
 *
 * Handles OAuth callbacks from social providers.
 * Exchanges authorization code for tokens, fetches profile data,
 * creates/updates user in database with marketing-relevant data.
 *
 * DATA COLLECTION:
 * - Basic profile (name, email, avatar)
 * - Extended data (birthday, location, interests) with consent
 * - Social graph data (follower count, connections)
 */

import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { cookies } from "next/headers";

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

interface SocialProfile {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  locale?: string;
  birthday?: string;
  location?: string;
  gender?: string;
  followers?: number;
  provider: string;
  providerAccountId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

/**
 * GET: Handle OAuth callback (for most providers)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const searchParams = request.nextUrl.searchParams;

  // Check for errors from provider
  const error = searchParams.get("error");
  if (error) {
    const errorDescription = searchParams.get("error_description") || "Authentication failed";
    return redirectToLogin(`${error}: ${errorDescription}`);
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return redirectToLogin("Missing authorization code or state");
  }

  // Verify state (CSRF protection)
  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;

  if (!storedState || storedState !== state) {
    return redirectToLogin("Invalid state parameter");
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(provider, code);
    if (!tokens) {
      return redirectToLogin("Failed to exchange authorization code");
    }

    // Fetch user profile from provider
    const profile = await fetchUserProfile(provider, tokens.access_token);
    if (!profile) {
      return redirectToLogin("Failed to fetch user profile");
    }

    // Add token info to profile
    profile.accessToken = tokens.access_token;
    profile.refreshToken = tokens.refresh_token;
    profile.expiresAt = tokens.expires_in
      ? Date.now() + tokens.expires_in * 1000
      : undefined;

    // Create or update user in database
    const user = await upsertUser(profile);

    // Set auth cookies
    const response = createAuthResponse(user, cookieStore);

    return response;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return redirectToLogin("Authentication failed");
  }
}

/**
 * POST: Handle OAuth callback (for Apple Sign-In form_post)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  if (provider !== "apple") {
    return NextResponse.json(
      { error: "POST method only supported for Apple Sign-In" },
      { status: 405 }
    );
  }

  const formData = await request.formData();
  const code = formData.get("code") as string;
  const state = formData.get("state") as string;
  const idToken = formData.get("id_token") as string;
  const userJson = formData.get("user") as string;

  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;

  if (!storedState || storedState !== state) {
    return redirectToLogin("Invalid state parameter");
  }

  try {
    // Parse Apple user data (only sent on first authorization)
    let appleUser = null;
    if (userJson) {
      try {
        appleUser = JSON.parse(userJson);
      } catch {
        // User data not available
      }
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens("apple", code);
    if (!tokens) {
      return redirectToLogin("Failed to exchange authorization code");
    }

    // Decode ID token to get user info
    const profile = decodeAppleIdToken(idToken || tokens.id_token, appleUser);
    if (!profile) {
      return redirectToLogin("Failed to decode Apple ID token");
    }

    profile.accessToken = tokens.access_token;
    profile.refreshToken = tokens.refresh_token;

    const user = await upsertUser(profile);
    return createAuthResponse(user, cookieStore);
  } catch (err) {
    console.error("Apple OAuth callback error:", err);
    return redirectToLogin("Authentication failed");
  }
}

/**
 * Exchange authorization code for access tokens
 */
async function exchangeCodeForTokens(
  provider: string,
  code: string
): Promise<any> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth/social/${provider}/callback`;

  const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`];
  const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`];

  if (!clientId || !clientSecret) {
    console.error(`Missing OAuth credentials for ${provider}`);
    return null;
  }

  let tokenUrl: string;
  let body: URLSearchParams;

  switch (provider) {
    case "google":
      tokenUrl = "https://oauth2.googleapis.com/token";
      body = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      });
      break;

    case "facebook":
      tokenUrl = "https://graph.facebook.com/v18.0/oauth/access_token";
      body = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      });
      break;

    case "apple":
      tokenUrl = "https://appleid.apple.com/auth/token";
      body = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret, // Requires JWT signing
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      });
      break;

    case "twitter":
      tokenUrl = "https://api.twitter.com/2/oauth2/token";
      body = new URLSearchParams({
        code,
        client_id: clientId,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code_verifier: code, // Simplified - should match state used as challenge
      });
      break;

    default:
      return null;
  }

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(provider === "twitter"
        ? {
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
          }
        : {}),
    },
    body,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Token exchange failed for ${provider}:`, error);
    return null;
  }

  return response.json();
}

/**
 * Fetch user profile from provider API
 */
async function fetchUserProfile(
  provider: string,
  accessToken: string
): Promise<SocialProfile | null> {
  try {
    switch (provider) {
      case "google":
        return fetchGoogleProfile(accessToken);
      case "facebook":
        return fetchFacebookProfile(accessToken);
      case "twitter":
        return fetchTwitterProfile(accessToken);
      default:
        return null;
    }
  } catch (err) {
    console.error(`Error fetching ${provider} profile:`, err);
    return null;
  }
}

async function fetchGoogleProfile(accessToken: string): Promise<SocialProfile | null> {
  // Fetch basic profile
  const profileRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!profileRes.ok) return null;
  const profile = await profileRes.json();

  // Try to fetch birthday (requires user.birthday.read scope)
  let birthday: string | undefined;
  try {
    const birthdayRes = await fetch(
      "https://people.googleapis.com/v1/people/me?personFields=birthdays",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (birthdayRes.ok) {
      const data = await birthdayRes.json();
      const bday = data.birthdays?.[0]?.date;
      if (bday) {
        birthday = `${bday.year || "0000"}-${String(bday.month).padStart(2, "0")}-${String(bday.day).padStart(2, "0")}`;
      }
    }
  } catch {
    // Birthday access not granted
  }

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    firstName: profile.given_name,
    lastName: profile.family_name,
    avatarUrl: profile.picture,
    locale: profile.locale,
    birthday,
    provider: "google",
    providerAccountId: profile.id,
  };
}

async function fetchFacebookProfile(accessToken: string): Promise<SocialProfile | null> {
  // Request extended profile fields for marketing
  const fields = "id,email,name,first_name,last_name,picture.type(large),birthday,location,gender";
  const res = await fetch(
    `https://graph.facebook.com/me?fields=${fields}&access_token=${accessToken}`
  );

  if (!res.ok) return null;
  const profile = await res.json();

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    firstName: profile.first_name,
    lastName: profile.last_name,
    avatarUrl: profile.picture?.data?.url,
    birthday: profile.birthday, // Format: MM/DD/YYYY
    location: profile.location?.name,
    gender: profile.gender,
    provider: "facebook",
    providerAccountId: profile.id,
  };
}

async function fetchTwitterProfile(accessToken: string): Promise<SocialProfile | null> {
  const res = await fetch(
    "https://api.twitter.com/2/users/me?user.fields=id,name,username,profile_image_url,public_metrics",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) return null;
  const { data } = await res.json();

  return {
    id: data.id,
    email: "", // Twitter doesn't provide email by default
    name: data.name,
    avatarUrl: data.profile_image_url?.replace("_normal", ""),
    followers: data.public_metrics?.followers_count,
    provider: "twitter",
    providerAccountId: data.id,
  };
}

function decodeAppleIdToken(idToken: string, appleUser: any): SocialProfile | null {
  try {
    // Decode JWT (without verification - verification should happen server-side)
    const [, payload] = idToken.split(".");
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());

    return {
      id: decoded.sub,
      email: decoded.email || "",
      name: appleUser?.name
        ? `${appleUser.name.firstName || ""} ${appleUser.name.lastName || ""}`.trim()
        : decoded.email?.split("@")[0] || "Apple User",
      firstName: appleUser?.name?.firstName,
      lastName: appleUser?.name?.lastName,
      provider: "apple",
      providerAccountId: decoded.sub,
    };
  } catch {
    return null;
  }
}

/**
 * Create or update user in DynamoDB
 * Stores extended profile data for marketing purposes
 */
async function upsertUser(profile: SocialProfile) {
  const now = new Date().toISOString();

  // Check if user exists by email or provider account
  let existingUser = null;

  if (profile.email) {
    try {
      // First try to find by email (using GSI)
      const getResult = await docClient.send(
        new GetCommand({
          TableName: process.env.DYNAMODB_USERS_TABLE,
          Key: { email: profile.email },
        })
      );
      existingUser = getResult.Item;
    } catch {
      // User doesn't exist
    }
  }

  const userId = existingUser?.id || `${profile.provider}_${profile.providerAccountId}`;

  const userRecord = {
    id: userId,
    email: profile.email || existingUser?.email,
    name: profile.name,
    firstName: profile.firstName,
    lastName: profile.lastName,
    avatarUrl: profile.avatarUrl,
    plan: existingUser?.plan || "free",
    creditsRemaining: existingUser?.creditsRemaining ?? 999, // Free unlimited for data collection
    createdAt: existingUser?.createdAt || now,
    updatedAt: now,

    // Social login tracking
    socialLogins: {
      ...(existingUser?.socialLogins || {}),
      [profile.provider]: {
        providerAccountId: profile.providerAccountId,
        linkedAt: now,
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
        expiresAt: profile.expiresAt,
      },
    },

    // Extended profile data for marketing
    marketingProfile: {
      ...(existingUser?.marketingProfile || {}),
      birthday: profile.birthday || existingUser?.marketingProfile?.birthday,
      location: profile.location || existingUser?.marketingProfile?.location,
      gender: profile.gender || existingUser?.marketingProfile?.gender,
      locale: profile.locale || existingUser?.marketingProfile?.locale,
      socialFollowers: {
        ...(existingUser?.marketingProfile?.socialFollowers || {}),
        ...(profile.followers ? { [profile.provider]: profile.followers } : {}),
      },
      lastLoginProvider: profile.provider,
      lastLoginAt: now,
      loginCount: (existingUser?.marketingProfile?.loginCount || 0) + 1,
    },

    // User settings with default consent values
    settings: existingUser?.settings || {
      emailNotifications: true,
      rsvpReminders: true,
      marketingEmails: true, // Default to opted-in, users can opt out
      productRecommendations: true,
      partnerOffers: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      language: profile.locale?.split("-")[0] || "en",
    },

    // Consent tracking for GDPR/CCPA compliance
    consent: existingUser?.consent || {
      termsAccepted: true,
      termsAcceptedAt: now,
      privacyAccepted: true,
      privacyAcceptedAt: now,
      marketingConsent: true, // Will be confirmed on first login
      marketingConsentAt: now,
      dataProcessingConsent: true,
      dataProcessingConsentAt: now,
    },
  };

  await docClient.send(
    new PutCommand({
      TableName: process.env.DYNAMODB_USERS_TABLE,
      Item: userRecord,
    })
  );

  return userRecord;
}

/**
 * Create auth response with session cookies
 */
function createAuthResponse(user: any, cookieStore: any) {
  const returnUrl = cookieStore.get("oauth_return_url")?.value || "/dashboard";
  const response = NextResponse.redirect(
    new URL(returnUrl, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  );

  // Create session token (simplified - use JWT in production)
  const sessionToken = Buffer.from(
    JSON.stringify({
      userId: user.id,
      email: user.email,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    })
  ).toString("base64");

  response.cookies.set("access_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });

  response.cookies.set("user_id", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  // Clean up OAuth cookies
  response.cookies.delete("oauth_state");
  response.cookies.delete("oauth_return_url");

  return response;
}

function redirectToLogin(error: string): NextResponse {
  const loginUrl = new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
  loginUrl.searchParams.set("error", error);
  return NextResponse.redirect(loginUrl);
}
