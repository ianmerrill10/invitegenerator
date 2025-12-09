/**
 * Reset Password API
 *
 * POST /api/auth/reset-password - Confirm password reset with code
 */

import { NextRequest, NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
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

// Validate password strength
function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { email, token, password } = await request.json();

    if (!email || !token || !password) {
      return errorResponse("Email, token, and password are required");
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      return errorResponse(passwordError);
    }

    // Confirm password reset with Cognito
    const clientId = process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;
    
    if (!clientId) {
      console.error("Missing COGNITO_CLIENT_ID environment variable");
      return errorResponse("Server configuration error", 500);
    }

    const command = new ConfirmForgotPasswordCommand({
      ClientId: clientId,
      Username: email,
      ConfirmationCode: token,
      Password: password,
      SecretHash: clientSecret ? calculateSecretHash(email, clientId, clientSecret) : undefined,
    });

    try {
      await cognitoClient.send(command);
    } catch (cognitoError: any) {
      console.error("Cognito reset password error:", cognitoError);

      if (cognitoError.name === "CodeMismatchException") {
        return errorResponse("Invalid or expired reset code");
      }

      if (cognitoError.name === "ExpiredCodeException") {
        return errorResponse("Reset code has expired. Please request a new one");
      }

      if (cognitoError.name === "UserNotFoundException") {
        return errorResponse("Invalid reset request");
      }

      if (cognitoError.name === "InvalidPasswordException") {
        return errorResponse("Password does not meet security requirements");
      }

      if (cognitoError.name === "LimitExceededException") {
        return errorResponse("Too many attempts. Please try again later.", 429);
      }

      throw cognitoError;
    }

    return NextResponse.json({
      success: true,
      data: { message: "Password has been reset successfully" },
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return errorResponse("Failed to reset password. Please try again.", 500);
  }
}
