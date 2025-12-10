/**
 * Forgot Password API
 *
 * POST /api/auth/forgot-password - Request password reset
 */

import { NextRequest, NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  ForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { checkRateLimit, rateLimitResponse, rateLimiters } from "@/lib/rate-limit";
import crypto from "crypto";

function calculateSecretHash(username: string, clientId: string, clientSecret: string): string {
  return crypto
    .createHmac("SHA256", clientSecret)
    .update(username + clientId)
    .digest("base64");
}

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || "us-east-1",
});

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { success: false, error: { code: "ERROR", message } },
    { status }
  );
}

export async function POST(request: NextRequest) {
  // Apply rate limiting for password reset (prevent abuse)
  const rateLimitResult = checkRateLimit(request, rateLimiters.auth);
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult, rateLimiters.auth.message);
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return errorResponse("Email is required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse("Please enter a valid email address");
    }

    // Request password reset from Cognito
    const clientId = process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;
    
    if (!clientId) {
      console.error("Missing COGNITO_CLIENT_ID environment variable");
      return errorResponse("Server configuration error", 500);
    }

    const command = new ForgotPasswordCommand({
      ClientId: clientId,
      Username: email,
      SecretHash: clientSecret ? calculateSecretHash(email, clientId, clientSecret) : undefined,
    });

    try {
      await cognitoClient.send(command);
    } catch (cognitoError: any) {
      console.error("Cognito forgot password error:", cognitoError);

      // Don't reveal if user exists or not for security
      if (cognitoError.name === "UserNotFoundException") {
        // Return success anyway to prevent email enumeration
        return NextResponse.json({
          success: true,
          data: { message: "If an account exists, you will receive an email" },
        });
      }

      if (cognitoError.name === "LimitExceededException") {
        return errorResponse("Too many requests. Please try again later.", 429);
      }

      if (cognitoError.name === "InvalidParameterException") {
        return errorResponse("User account is not verified");
      }

      throw cognitoError;
    }

    return NextResponse.json({
      success: true,
      data: { message: "If an account exists, you will receive an email" },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return errorResponse("Failed to process request. Please try again.", 500);
  }
}
