import { NextRequest, NextResponse } from "next/server";
import { confirmForgotPassword } from "@/services/aws/cognito";
import { applyRateLimit, PASSWORD_RESET_RATE_LIMIT } from "@/lib/rate-limit";

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
    const { email, code, newPassword } = body;

    // Validate inputs
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check for password complexity (at least one uppercase, lowercase, number, special char)
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      return NextResponse.json(
        {
          error:
            "Password must contain at least one uppercase letter, lowercase letter, number, and special character",
        },
        { status: 400 }
      );
    }

    // Confirm the password reset
    const result = await confirmForgotPassword(
      email.toLowerCase().trim(),
      code.trim(),
      newPassword
    );

    if (!result.success) {
      // Map Cognito error codes to user-friendly messages
      let errorMessage = "Failed to reset password";
      if (result.errorCode === "CodeMismatchException") {
        errorMessage = "Invalid verification code";
      } else if (result.errorCode === "ExpiredCodeException") {
        errorMessage = "Verification code has expired. Please request a new one.";
      } else if (result.errorCode === "InvalidPasswordException") {
        errorMessage = "Password does not meet requirements";
      }

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
