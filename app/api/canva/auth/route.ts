import { NextRequest, NextResponse } from "next/server";
import { getCanvaAuthUrl } from "@/lib/canva/client";
import { v4 as uuidv4 } from "uuid";

/**
 * GET /api/canva/auth
 * Initiate Canva OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    // Generate state for CSRF protection
    const state = uuidv4();

    // Get the authorization URL
    const authUrl = getCanvaAuthUrl(state);

    // Create response with state cookie
    const response = NextResponse.redirect(authUrl);

    // Store state in cookie for verification
    response.cookies.set("canva_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Canva auth error:", error);
    return NextResponse.json(
      { error: { message: "Failed to initiate Canva authentication" } },
      { status: 500 }
    );
  }
}
