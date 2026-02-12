import { NextRequest, NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  AdminConfirmSignUpCommand,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { cookies } from "next/headers";
import { logAuditEvent, getClientIP } from "@/lib/audit-log";
import { applyRateLimit, AUTH_RATE_LIMIT } from "@/lib/rate-limit";
import { sendWelcomeEmail } from "@/lib/email";
import { validatePassword } from "@/lib/utils";

// Initialize AWS clients
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Helper to create error response
function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: { code: "AUTH_ERROR", message },
    },
    { status }
  );
}


export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimit = applyRateLimit(request, AUTH_RATE_LIMIT);
  if (rateLimit.error) {
    return NextResponse.json(
      { success: false, error: { code: "RATE_LIMITED", message: rateLimit.error.message } },
      { status: rateLimit.error.status, headers: rateLimit.headers }
    );
  }

  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return errorResponse("Name, email, and password are required");
    }

    if (name.length < 2) {
      return errorResponse("Name must be at least 2 characters");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse("Please enter a valid email address");
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      return errorResponse(passwordCheck.errors[0]);
    }

    // Sign up with Cognito
    const signUpCommand = new SignUpCommand({
      ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: name },
      ],
    });

    let signUpResult;
    try {
      signUpResult = await cognitoClient.send(signUpCommand);
    } catch (signUpError: unknown) {
      console.error("Cognito signup error:", signUpError);

      const errName = signUpError instanceof Error ? (signUpError as Error & { name: string }).name : "";
      if (errName === "UsernameExistsException") {
        return errorResponse("An account with this email already exists");
      }
      if (errName === "InvalidPasswordException") {
        return errorResponse("Password does not meet security requirements");
      }
      if (errName === "InvalidParameterException") {
        return errorResponse(signUpError instanceof Error ? signUpError.message : "Invalid input");
      }

      return errorResponse("Registration failed. Please try again.");
    }

    const userSub = signUpResult.UserSub;

    // Auto-confirm user for development (remove in production with email verification)
    if (process.env.NODE_ENV === "development") {
      try {
        const confirmCommand = new AdminConfirmSignUpCommand({
          UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
          Username: email,
        });
        await cognitoClient.send(confirmCommand);
      } catch (confirmError) {
        console.error("Auto-confirm error:", confirmError);
        // Continue anyway - user might need to verify email
      }
    }

    // Create user record in DynamoDB
    const now = new Date().toISOString();
    const userRecord = {
      id: userSub,
      email,
      name,
      plan: "free",
      creditsRemaining: 5, // Free tier AI credits
      createdAt: now,
      updatedAt: now,
      settings: {
        emailNotifications: true,
        rsvpReminders: true,
        marketingEmails: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        language: "en",
      },
    };

    try {
      const putCommand = new PutCommand({
        TableName: process.env.DYNAMODB_USERS_TABLE,
        Item: userRecord,
        ConditionExpression: "attribute_not_exists(id)",
      });
      await docClient.send(putCommand);
    } catch (dbError) {
      console.error("DynamoDB error:", dbError);
      // Continue - user was created in Cognito
    }

    // Auto-login after signup (for development)
    let tokens = null;
    if (process.env.NODE_ENV === "development") {
      try {
        const authCommand = new InitiateAuthCommand({
          AuthFlow: "USER_PASSWORD_AUTH",
          ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
          },
        });
        const authResult = await cognitoClient.send(authCommand);
        tokens = authResult.AuthenticationResult;
      } catch (authError) {
        console.error("Auto-login error:", authError);
        // Continue - user can log in manually
      }
    }

    // Set cookies if we have tokens
    if (tokens) {
      const cookieStore = await cookies();

      // Secure cookie settings for authentication tokens
      const isProduction = process.env.NODE_ENV === "production";
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction, // HTTPS only in production
        sameSite: "strict" as const, // Strict prevents CSRF
        path: "/",
      };

      if (tokens.AccessToken) {
        cookieStore.set("access_token", tokens.AccessToken, {
          ...cookieOptions,
          maxAge: tokens.ExpiresIn || 3600,
        });
      }

      if (tokens.IdToken) {
        cookieStore.set("id_token", tokens.IdToken, {
          ...cookieOptions,
          maxAge: tokens.ExpiresIn || 3600,
        });
      }

      if (tokens.RefreshToken) {
        cookieStore.set("refresh_token", tokens.RefreshToken, {
          ...cookieOptions,
          maxAge: 30 * 24 * 60 * 60,
        });
      }
    }

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, name).catch(console.error);

    // Log successful signup
    logAuditEvent("auth.signup", {
      userId: userRecord.id,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      outcome: "success",
      details: { email: email.replace(/(.{2})(.*)(@.*)/, "$1***$3") },
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...userRecord,
          avatarUrl: null,
        },
        requiresVerification: !tokens,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return errorResponse("An unexpected error occurred", 500);
  }
}
