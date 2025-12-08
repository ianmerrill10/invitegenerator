import { NextRequest, NextResponse } from "next/server";
import { CanvaClient } from "@/lib/canva/client";
import { cookies } from "next/headers";

/**
 * GET /api/canva/status
 * Check Canva connection status
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("canva_access_token")?.value;
    const refreshToken = cookieStore.get("canva_refresh_token")?.value;

    if (!accessToken) {
      return NextResponse.json({
        data: {
          connected: false,
          user: null,
        },
      });
    }

    // Try to get user profile to verify token
    const client = new CanvaClient(accessToken);

    try {
      const profile = await client.getUserProfile();

      return NextResponse.json({
        data: {
          connected: true,
          user: {
            id: profile.user.id,
            displayName: profile.user.display_name,
          },
          team: profile.team
            ? {
                id: profile.team.id,
                displayName: profile.team.display_name,
              }
            : null,
          hasRefreshToken: !!refreshToken,
        },
      });
    } catch (error) {
      // Token might be expired
      return NextResponse.json({
        data: {
          connected: false,
          expired: true,
          user: null,
        },
      });
    }
  } catch (error) {
    console.error("Error checking Canva status:", error);
    return NextResponse.json(
      { error: { message: "Failed to check Canva connection" } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/canva/status
 * Disconnect from Canva
 */
export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({
      data: { disconnected: true },
    });

    // Clear all Canva-related cookies
    response.cookies.delete("canva_access_token");
    response.cookies.delete("canva_refresh_token");
    response.cookies.delete("canva_oauth_state");

    return response;
  } catch (error) {
    console.error("Error disconnecting Canva:", error);
    return NextResponse.json(
      { error: { message: "Failed to disconnect from Canva" } },
      { status: 500 }
    );
  }
}
