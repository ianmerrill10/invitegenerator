/**
 * Centralized Authentication Utility
 *
 * This module provides secure JWT verification using Cognito's JWKS.
 * All API routes should use these functions instead of jwt.decode().
 */

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

// Types
export interface AuthenticatedUser {
  userId: string;
  email?: string;
  name?: string;
}

export interface AuthError {
  code: "UNAUTHORIZED" | "TOKEN_EXPIRED" | "INVALID_TOKEN" | "SERVER_ERROR";
  message: string;
}

export type AuthResult =
  | { success: true; user: AuthenticatedUser }
  | { success: false; error: AuthError };

// Configuration
const COGNITO_REGION = process.env.AWS_REGION || "us-east-1";
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

// JWKS client for fetching Cognito's public keys
let _jwksClient: jwksClient.JwksClient | null = null;

function getJwksClient(): jwksClient.JwksClient {
  if (!_jwksClient) {
    if (!COGNITO_USER_POOL_ID) {
      throw new Error("COGNITO_USER_POOL_ID is not configured");
    }

    _jwksClient = jwksClient({
      jwksUri: `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
      cache: true,
      cacheMaxAge: 600000, // 10 minutes
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });
  }
  return _jwksClient;
}

/**
 * Get the signing key from JWKS
 */
function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback): void {
  const client = getJwksClient();

  if (!header.kid) {
    callback(new Error("No kid in token header"));
    return;
  }

  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

// Extended JWT payload type for Cognito tokens
interface CognitoJwtPayload extends jwt.JwtPayload {
  client_id?: string;
  token_use?: string;
  email?: string;
  name?: string;
}

/**
 * Verify a JWT token using Cognito's public keys
 */
async function verifyToken(token: string): Promise<CognitoJwtPayload> {
  return new Promise((resolve, reject) => {
    const options: jwt.VerifyOptions = {
      algorithms: ["RS256"],
      issuer: `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`,
    };

    jwt.verify(token, getKey, options, (err, decoded) => {
      if (err) {
        reject(err);
        return;
      }

      if (!decoded || typeof decoded === "string") {
        reject(new Error("Invalid token payload"));
        return;
      }

      // Cast to our extended payload type
      const payload = decoded as CognitoJwtPayload;

      // Verify the token is for our client
      if (COGNITO_CLIENT_ID) {
        const audience = payload.aud || payload.client_id;
        if (audience !== COGNITO_CLIENT_ID) {
          reject(new Error("Token was not issued for this client"));
          return;
        }
      }

      // Verify token_use claim for access tokens
      if (payload.token_use && payload.token_use !== "access" && payload.token_use !== "id") {
        reject(new Error("Invalid token_use claim"));
        return;
      }

      resolve(payload);
    });
  });
}

/**
 * Get the authenticated user from the request cookies.
 * This function properly verifies JWT tokens using Cognito's JWKS.
 *
 * @returns AuthResult with either the authenticated user or an error
 */
export async function getAuthenticatedUser(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const idToken = cookieStore.get("id_token")?.value;

    // Prefer id_token as it contains user claims, fallback to access_token
    const token = idToken || accessToken;

    if (!token) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "No authentication token provided",
        },
      };
    }

    // Verify the token
    const decoded = await verifyToken(token);

    // Extract user information
    const userId = decoded.sub;
    if (!userId) {
      return {
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Token does not contain user ID",
        },
      };
    }

    return {
      success: true,
      user: {
        userId,
        email: decoded.email,
        name: decoded.name,
      },
    };
  } catch (error) {
    console.error("Authentication error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return {
        success: false,
        error: {
          code: "TOKEN_EXPIRED",
          message: "Authentication token has expired",
        },
      };
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return {
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid authentication token",
        },
      };
    }

    return {
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Authentication verification failed",
      },
    };
  }
}

/**
 * Simple helper to get just the user ID if authenticated.
 * Returns null if not authenticated.
 *
 * @deprecated Prefer getAuthenticatedUser() for better error handling
 */
export async function getUserId(): Promise<string | null> {
  const result = await getAuthenticatedUser();
  return result.success ? result.user.userId : null;
}

/**
 * Require authentication - throws if not authenticated.
 * Use this in API routes that require authentication.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const result = await getAuthenticatedUser();

  if (!result.success) {
    const error = new Error(result.error.message) as Error & { code: string; statusCode: number };
    error.code = result.error.code;
    error.statusCode = result.error.code === "UNAUTHORIZED" ? 401 : 403;
    throw error;
  }

  return result.user;
}
