"use client";

/**
 * Forgot Password Page
 *
 * Allows users to request a password reset link.
 */

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to send reset email");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

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
              Check Your Email
            </h1>
            <p className="text-surface-600 mb-6">
              We've sent a password reset link to{" "}
              <span className="font-medium text-surface-900">{email}</span>.
              Please check your inbox and follow the instructions.
            </p>
            <p className="text-sm text-surface-500 mb-6">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setIsSuccess(false)}
                className="text-brand-600 hover:underline"
              >
                try again
              </button>
              .
            </p>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
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
            Forgot Password?
          </h1>
          <p className="text-surface-600">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-error-50 border border-error-200 rounded-xl text-error-700 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              leftIcon={<Mail className="h-5 w-5" />}
              required
              autoFocus
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-surface-600 hover:text-surface-900"
            >
              <ArrowLeft className="h-4 w-4 inline mr-1" />
              Back to Login
            </Link>
          </div>
        </Card>

        <p className="mt-8 text-center text-sm text-surface-500">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-brand-600 hover:text-brand-700 font-medium"
          >
            Sign up for free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
