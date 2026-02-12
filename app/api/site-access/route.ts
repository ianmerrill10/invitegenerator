import { NextRequest, NextResponse } from "next/server";

const SITE_PASSWORD = process.env.SITE_PASSWORD;
const PASSWORD_COOKIE_NAME = "site_access_granted";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!SITE_PASSWORD) {
      return NextResponse.json({ success: true });
    }

    if (password === SITE_PASSWORD) {
      const response = NextResponse.json({ success: true });

      // Set the access cookie
      response.cookies.set(PASSWORD_COOKIE_NAME, SITE_PASSWORD, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Site access error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
