import { NextResponse } from "next/server";
import { getOrCreateCSRFToken, setCSRFCookie } from "@/lib/csrf";

/**
 * GET /api/auth/csrf
 * Returns a CSRF token for use in subsequent requests
 */
export async function GET() {
  try {
    const { token, isNew } = await getOrCreateCSRFToken();

    const response = NextResponse.json({
      success: true,
      csrfToken: token,
    });

    if (isNew) {
      setCSRFCookie(response, token);
    }

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "CSRF_ERROR", message: "Failed to generate CSRF token" } },
      { status: 500 }
    );
  }
}
