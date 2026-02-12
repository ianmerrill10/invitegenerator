import { NextRequest, NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { cookies } from "next/headers";
import { applyRateLimit, AUTH_RATE_LIMIT } from "@/lib/rate-limit";
import { logAuthAttempt, logRateLimitExceeded } from "@/lib/audit-log";

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
    // Log rate limit exceeded
    logRateLimitExceeded(request, "/api/auth/login").catch(console.error);
    return NextResponse.json(
      { success: false, error: { code: "RATE_LIMITED", message: rateLimit.error.message } },
      { status: rateLimit.error.status, headers: rateLimit.headers }
    );
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return errorResponse("Email and password are required");
    }

    // Authenticate with Cognito
    const authCommand = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    let authResult;
    try {
      authResult = await cognitoClient.send(authCommand);
    } catch (authError: unknown) {
      console.error("Cognito auth error:", authError);

      const errName = authError instanceof Error ? (authError as Error & { name: string }).name : "";
      // Log failed authentication attempt
      logAuthAttempt(request, {
        email,
        success: false,
        reason: errName || "Unknown error",
      }).catch(console.error);

      if (errName === "NotAuthorizedException") {
        return errorResponse("Invalid email or password", 401);
      }
      if (errName === "UserNotFoundException") {
        return errorResponse("Invalid email or password", 401);
      }
      if (errName === "UserNotConfirmedException") {
        return errorResponse("Please verify your email address first", 401);
      }
      
      return errorResponse("Authentication failed", 500);
    }

    if (!authResult.AuthenticationResult) {
      return errorResponse("Authentication failed", 500);
    }

    const { AccessToken, IdToken, RefreshToken, ExpiresIn } =
      authResult.AuthenticationResult;

    // Get user info from Cognito
    const getUserCommand = new GetUserCommand({
      AccessToken,
    });

    const cognitoUser = await cognitoClient.send(getUserCommand);
    const userSub = cognitoUser.UserAttributes?.find(
      (attr) => attr.Name === "sub"
    )?.Value;

    // Get additional user data from DynamoDB
    let userData = null;
    if (userSub) {
      try {
        const getCommand = new GetCommand({
          TableName: process.env.DYNAMODB_USERS_TABLE,
          Key: { id: userSub },
        });
        const result = await docClient.send(getCommand);
        userData = result.Item;
      } catch (dbError) {
        console.error("DynamoDB error:", dbError);
        // Continue without additional user data
      }
    }

    // Construct user object
    const user = {
      id: userSub,
      email:
        cognitoUser.UserAttributes?.find((attr) => attr.Name === "email")
          ?.Value || email,
      name:
        userData?.name ||
        cognitoUser.UserAttributes?.find((attr) => attr.Name === "name")?.Value ||
        email.split("@")[0],
      avatarUrl: userData?.avatarUrl,
      plan: userData?.plan || "free",
      creditsRemaining: userData?.creditsRemaining ?? 5,
      createdAt: userData?.createdAt || new Date().toISOString(),
      updatedAt: userData?.updatedAt || new Date().toISOString(),
      settings: userData?.settings || {
        emailNotifications: true,
        rsvpReminders: true,
        marketingEmails: false,
        timezone: "UTC",
        language: "en",
      },
    };

    // Set HTTP-only cookies for tokens
    const cookieStore = await cookies();
    
    // Secure cookie settings for authentication tokens
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // HTTPS only in production
      sameSite: "strict" as const, // Strict prevents CSRF
      path: "/",
    };

    cookieStore.set("access_token", AccessToken!, {
      ...cookieOptions,
      maxAge: ExpiresIn || 3600,
    });

    if (IdToken) {
      cookieStore.set("id_token", IdToken, {
        ...cookieOptions,
        maxAge: ExpiresIn || 3600,
      });
    }

    if (RefreshToken) {
      cookieStore.set("refresh_token", RefreshToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    // Log successful authentication
    logAuthAttempt(request, {
      email,
      success: true,
      userId: user.id,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("An unexpected error occurred", 500);
  }
}
