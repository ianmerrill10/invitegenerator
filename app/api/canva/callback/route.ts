import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/canva/client";

/**
 * GET /api/canva/callback
 * Handle Canva OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Check for OAuth errors
    if (error) {
      console.error("Canva OAuth error:", error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/admin?canva_error=${encodeURIComponent(errorDescription || error)}`,
          request.url
        )
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/admin?canva_error=Missing+authorization+code", request.url)
      );
    }

    // Verify state matches cookie
    const storedState = request.cookies.get("canva_oauth_state")?.value;
    if (state !== storedState) {
      return NextResponse.redirect(
        new URL("/admin?canva_error=Invalid+state+parameter", request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Create success redirect
    const response = NextResponse.redirect(
      new URL("/admin?canva_connected=true", request.url)
    );

    // Store tokens in secure cookies (in production, store in database)
    response.cookies.set("canva_access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.expires_in,
      path: "/",
    });

    if (tokens.refresh_token) {
      response.cookies.set("canva_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    // Clear state cookie
    response.cookies.delete("canva_oauth_state");

    return response;
  } catch (error) {
    console.error("Canva callback error:", error);
    return NextResponse.redirect(
      new URL("/admin?canva_error=Authentication+failed", request.url)
    );
  }
}
