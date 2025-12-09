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
import { v4 as uuidv4 } from "uuid";
import { AUTH_CONFIG } from "@/lib/auth-config";
import crypto from "crypto";

function calculateSecretHash(username: string, clientId: string, clientSecret: string): string {
  return crypto
    .createHmac("SHA256", clientSecret)
    .update(username + clientId)
    .digest("base64");
}

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

    // Check if email is in the allowed list
    if (!AUTH_CONFIG.isEmailAllowed(email)) {
      return errorResponse("Access denied. This email is not authorized to sign up.", 403);
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return errorResponse(passwordError);
    }

    // Sign up with Cognito
    const clientId = process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;
    
    if (!clientId) {
      console.error("Missing COGNITO_CLIENT_ID environment variable");
      return errorResponse("Server configuration error", 500);
    }

    const signUpCommand = new SignUpCommand({
      ClientId: clientId,
      Username: email,
      Password: password,
      SecretHash: clientSecret ? calculateSecretHash(email, clientId, clientSecret) : undefined,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: name },
      ],
    });

    let signUpResult;
    try {
      signUpResult = await cognitoClient.send(signUpCommand);
    } catch (signUpError: any) {
      console.error("Cognito signup error:", signUpError);

      if (signUpError.name === "UsernameExistsException") {
        return errorResponse("An account with this email already exists");
      }
      if (signUpError.name === "InvalidPasswordException") {
        return errorResponse("Password does not meet security requirements");
      }
      if (signUpError.name === "InvalidParameterException") {
        return errorResponse(signUpError.message || "Invalid input");
      }

      return errorResponse("Registration failed. Please try again.");
    }

    const userSub = signUpResult.UserSub;

    // Auto-confirm user for development (remove in production with email verification)
    if (process.env.NODE_ENV === "development") {
      try {
        const userPoolId = process.env.COGNITO_USER_POOL_ID || process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
        if (userPoolId) {
          const confirmCommand = new AdminConfirmSignUpCommand({
            UserPoolId: userPoolId,
            Username: email,
          });
          await cognitoClient.send(confirmCommand);
        }
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
        const authParameters: Record<string, string> = {
          USERNAME: email,
          PASSWORD: password,
        };
        if (clientSecret) {
          authParameters.SECRET_HASH = calculateSecretHash(email, clientId, clientSecret);
        }
        const authCommand = new InitiateAuthCommand({
          AuthFlow: "USER_PASSWORD_AUTH",
          ClientId: clientId,
          AuthParameters: authParameters,
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

      if (tokens.AccessToken) {
        cookieStore.set("access_token", tokens.AccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: tokens.ExpiresIn || 3600,
          path: "/",
        });
      }

      if (tokens.IdToken) {
        cookieStore.set("id_token", tokens.IdToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: tokens.ExpiresIn || 3600,
          path: "/",
        });
      }

      if (tokens.RefreshToken) {
        cookieStore.set("refresh_token", tokens.RefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });
      }
    }

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
