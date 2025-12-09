import { NextRequest, NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { cookies } from "next/headers";
import { AUTH_CONFIG } from "@/lib/auth-config";
import crypto from "crypto";

function calculateSecretHash(username: string, clientId: string, clientSecret: string): string {
  return crypto
    .createHmac("SHA256", clientSecret)
    .update(username + clientId)
    .digest("base64");
}

// Initialize AWS clients (trim region to handle env vars with trailing newlines)
const awsRegion = (process.env.AWS_REGION || "us-east-1").trim();

const cognitoClient = new CognitoIdentityProviderClient({
  region: awsRegion,
});

const dynamoClient = new DynamoDBClient({
  region: awsRegion,
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
  try {
    const body = await request.json();
    const { email: rawEmail, password } = body;

    // Normalize email to lowercase for case-insensitive login
    const email = rawEmail?.toLowerCase().trim();

    // Validate input
    if (!email || !password) {
      return errorResponse("Email and password are required");
    }

    // Check if email is in the allowed list
    if (!AUTH_CONFIG.isEmailAllowed(email)) {
      return errorResponse("Access denied. This email is not authorized.", 403);
    }

    // Authenticate with Cognito
    const clientId = process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;
    
    if (!clientId) {
      console.error("Missing COGNITO_CLIENT_ID environment variable");
      return errorResponse("Server configuration error", 500);
    }

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

    let authResult;
    try {
      authResult = await cognitoClient.send(authCommand);
    } catch (authError: any) {
      console.error("Cognito auth error:", authError);
      
      if (authError.name === "NotAuthorizedException") {
        return errorResponse("Invalid email or password", 401);
      }
      if (authError.name === "UserNotFoundException") {
        return errorResponse("Invalid email or password", 401);
      }
      if (authError.name === "UserNotConfirmedException") {
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
    
    cookieStore.set("access_token", AccessToken!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ExpiresIn || 3600,
      path: "/",
    });

    if (IdToken) {
      cookieStore.set("id_token", IdToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: ExpiresIn || 3600,
        path: "/",
      });
    }

    if (RefreshToken) {
      cookieStore.set("refresh_token", RefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });
    }

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("An unexpected error occurred", 500);
  }
}
