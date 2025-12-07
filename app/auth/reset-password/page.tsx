"use client";

/**
 * Reset Password Page
 *
 * Allows users to set a new password using a reset token.
 */

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  // Password validation
  const passwordChecks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "Contains uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", valid: /[a-z]/.test(password) },
    { label: "Contains number", valid: /[0-9]/.test(password) },
  ];

  const isPasswordValid = passwordChecks.every((check) => check.valid);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  useEffect(() => {
    if (!token || !email) {
      setIsValidToken(false);
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      setError("Please meet all password requirements");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to reset password");
      }

      setIsSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/auth/login?reset=success");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-8 w-8 text-error-600" />
          </div>
          <h1 className="text-2xl font-display font-bold text-surface-900 mb-2">
            Invalid or Expired Link
          </h1>
          <p className="text-surface-600 mb-6">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <Link href="/auth/forgot-password">
            <Button variant="primary" className="w-full">
              Request New Link
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-md p-8 text-center">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-success-600" />
            </div>
            <h1 className="text-2xl font-display font-bold text-surface-900 mb-2">
              Password Reset!
            </h1>
            <p className="text-surface-600 mb-6">
              Your password has been successfully reset. You'll be redirected to
              login in a moment.
            </p>
            <Link href="/auth/login">
              <Button variant="primary" className="w-full">
                Continue to Login
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-display font-bold text-brand-500">
              InviteGenerator
            </span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-surface-900 mb-2">
            Set New Password
          </h1>
          <p className="text-surface-600">
            Create a strong password for your account.
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-error-50 border border-error-200 rounded-xl text-error-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <Input
                label="New Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                leftIcon={<Lock className="h-5 w-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-surface-400 hover:text-surface-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
                required
              />

              {/* Password requirements */}
              <div className="mt-3 space-y-1">
                {passwordChecks.map((check, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-sm ${
                      check.valid ? "text-success-600" : "text-surface-500"
                    }`}
                  >
                    {check.valid ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-current" />
                    )}
                    {check.label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Input
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                leftIcon={<Lock className="h-5 w-5" />}
                required
              />
              {confirmPassword && (
                <p
                  className={`mt-2 text-sm ${
                    passwordsMatch ? "text-success-600" : "text-error-600"
                  }`}
                >
                  {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading || !isPasswordValid || !passwordsMatch}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-surface-200 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-4 bg-surface-200 rounded w-3/4 mx-auto"></div>
          </div>
        </Card>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
