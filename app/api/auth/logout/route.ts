import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logAuditEvent, getClientIP } from "@/lib/audit-log";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Clear all auth cookies
    cookieStore.delete("access_token");
    cookieStore.delete("id_token");
    cookieStore.delete("refresh_token");

    // Log logout event
    logAuditEvent("auth.logout", {
      ipAddress: getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      outcome: "success",
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      data: { message: "Logged out successfully" },
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "LOGOUT_ERROR", message: "Failed to logout" },
      },
      { status: 500 }
    );
  }
}
