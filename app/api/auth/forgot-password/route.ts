import { NextRequest, NextResponse } from "next/server";
import { forgotPassword } from "@/services/aws/cognito";
import { applyRateLimit, PASSWORD_RESET_RATE_LIMIT } from "@/lib/rate-limit";
import { logAuditEvent, getClientIP } from "@/lib/audit-log";

export async function POST(request: NextRequest) {
  // Apply strict rate limiting for password reset
  const rateLimit = applyRateLimit(request, PASSWORD_RESET_RATE_LIMIT);
  if (rateLimit.error) {
    return NextResponse.json(
      { error: rateLimit.error.message },
      { status: rateLimit.error.status, headers: rateLimit.headers }
    );
  }

  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Initiate forgot password flow
    const result = await forgotPassword(email.toLowerCase().trim());

    if (!result.success) {
      // Don't reveal if user exists or not for security
      // Always return success to prevent user enumeration
      console.error("Forgot password error:", result.error);
    }

    // Log password reset request
    logAuditEvent("auth.password.reset.request", {
      ipAddress: getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      outcome: "success",
      details: { email: email.replace(/(.{2})(.*)(@.*)/, "$1***$3") },
    }).catch(console.error);

    // Always return success to prevent user enumeration attacks
    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a password reset code has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
