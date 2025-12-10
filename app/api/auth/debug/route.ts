import { NextResponse } from "next/server";

// Debug endpoint to check environment variable configuration
// This does NOT expose actual secret values, only checks if they exist
export async function GET() {
  const envCheck = {
    COGNITO_CLIENT_ID: !!process.env.COGNITO_CLIENT_ID,
    NEXT_PUBLIC_COGNITO_CLIENT_ID: !!process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    COGNITO_USER_POOL_ID: !!process.env.COGNITO_USER_POOL_ID,
    NEXT_PUBLIC_COGNITO_USER_POOL_ID: !!process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    COGNITO_CLIENT_SECRET: !!process.env.COGNITO_CLIENT_SECRET,
    AWS_REGION: !!process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
    DYNAMODB_USERS_TABLE: !!process.env.DYNAMODB_USERS_TABLE,
  };

  // Show partial values for debugging (first 4 chars only, safe to expose)
  const partialValues = {
    COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID?.substring(0, 4) + "..." || "NOT SET",
    COGNITO_CLIENT_SECRET_LENGTH: process.env.COGNITO_CLIENT_SECRET?.length || 0,
    AWS_REGION: process.env.AWS_REGION || "NOT SET (defaults to us-east-1)",
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID?.substring(0, 4) + "..." || "NOT SET",
  };

  // Note: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are NOT required
  // when using an IAM Compute role in Amplify - the SDK gets credentials from the role
  const allRequired =
    envCheck.COGNITO_CLIENT_SECRET &&
    (envCheck.COGNITO_CLIENT_ID || envCheck.NEXT_PUBLIC_COGNITO_CLIENT_ID);

  return NextResponse.json({
    status: allRequired ? "OK" : "MISSING ENV VARS",
    envCheck,
    partialValues,
    message: allRequired
      ? "All required environment variables are set"
      : "Some required environment variables are missing. Check envCheck for details.",
  });
}
