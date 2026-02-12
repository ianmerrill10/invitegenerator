"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewsletterSignupProps {
  variant?: "default" | "compact" | "hero";
  className?: string;
}

export function NewsletterSignup({ variant = "default", className = "" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      // In production, this would call an API endpoint
      // For now, simulate a successful signup
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSuccess(true);
      setEmail("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`flex items-center gap-3 p-4 bg-green-50 rounded-xl ${className}`}>
        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
        <div>
          <p className="font-medium text-green-800">You&apos;re subscribed!</p>
          <p className="text-sm text-green-600">Check your inbox for a confirmation email.</p>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          required
        />
        <Button type="submit" disabled={isLoading} size="sm">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
        </Button>
      </form>
    );
  }

  if (variant === "hero") {
    return (
      <div className={`bg-gradient-to-r from-brand-500 to-accent-500 rounded-2xl p-8 text-white ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6" />
          <span className="text-sm font-medium uppercase tracking-wider">Newsletter</span>
        </div>
        <h3 className="text-2xl font-heading font-bold mb-2">
          Get invitation tips & templates
        </h3>
        <p className="text-white/80 mb-6">
          Join 10,000+ event planners receiving weekly inspiration and exclusive templates.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            required
          />
          <Button
            type="submit"
            disabled={isLoading}
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-brand-600"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Subscribe
              </>
            )}
          </Button>
        </form>
        {error && <p className="mt-3 text-sm text-red-200">{error}</p>}
        <p className="mt-4 text-xs text-white/60">
          No spam, unsubscribe anytime. By subscribing you agree to our Privacy Policy.
        </p>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-surface-50 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
          <Mail className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-surface-900">Stay Updated</h3>
          <p className="text-sm text-surface-600">Get tips, templates & exclusive offers</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Subscribe to Newsletter"
          )}
        </Button>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
      <p className="mt-3 text-xs text-surface-500 text-center">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  );
}
