import { CognitoIdentityProviderClient, GetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || "us-east-1",
});

interface AuthResult {
  authenticated: boolean;
  userId: string | null;
  email?: string;
}

/**
 * Verify authentication - can be called without request (uses cookies)
 * or with a request object (uses Authorization header or cookies)
 */
export async function verifyAuth(request?: NextRequest): Promise<AuthResult | string | null> {
  try {
    let accessToken: string | null = null;
    
    // If request is provided, try Authorization header first
    if (request) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        accessToken = authHeader.slice(7);
      }
    }
    
    // Fall back to cookies
    if (!accessToken) {
      const cookieStore = await cookies();
      accessToken = cookieStore.get("access_token")?.value || null;
    }

    if (!accessToken) {
      // If called with request, return structured response
      if (request) {
        return { authenticated: false, userId: null };
      }
      return null;
    }

    const command = new GetUserCommand({
      AccessToken: accessToken,
    });

    const response = await cognitoClient.send(command);
    
    // Find the 'sub' attribute which is the user ID
    const sub = response.UserAttributes?.find(attr => attr.Name === "sub")?.Value;
    const email = response.UserAttributes?.find(attr => attr.Name === "email")?.Value;
    const userId = sub || response.Username || null;
    
    // If called with request, return structured response
    if (request) {
      return { 
        authenticated: !!userId, 
        userId,
        email 
      };
    }
    
    // Legacy mode: return just the userId string
    return userId;
  } catch (error) {
    // If called with request, return structured response
    if (request) {
      return { authenticated: false, userId: null };
    }
    return null;
  }
}
