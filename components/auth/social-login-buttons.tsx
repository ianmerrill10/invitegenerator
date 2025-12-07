"use client";

/**
 * Social Login Buttons Component
 *
 * OAuth login buttons for supported social providers.
 * Initiates OAuth flow via /api/auth/social/[provider]
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SocialLoginButtonsProps {
  returnUrl?: string;
  onError?: (error: string) => void;
}

const PROVIDERS = [
  {
    id: "google",
    name: "Google",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
    bgColor: "bg-white hover:bg-gray-50",
    textColor: "text-gray-700",
    borderColor: "border-gray-300",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    bgColor: "bg-[#1877F2] hover:bg-[#166FE5]",
    textColor: "text-white",
    borderColor: "border-transparent",
  },
  {
    id: "apple",
    name: "Apple",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
      </svg>
    ),
    bgColor: "bg-black hover:bg-gray-900",
    textColor: "text-white",
    borderColor: "border-transparent",
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    bgColor: "bg-black hover:bg-gray-900",
    textColor: "text-white",
    borderColor: "border-transparent",
  },
];

export function SocialLoginButtons({
  returnUrl = "/dashboard",
  onError,
}: SocialLoginButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSocialLogin = (providerId: string) => {
    setLoading(providerId);

    // Build OAuth URL with return URL
    const params = new URLSearchParams();
    if (returnUrl) {
      params.set("returnUrl", returnUrl);
    }

    const url = `/api/auth/social/${providerId}${params.toString() ? `?${params}` : ""}`;

    // Redirect to OAuth flow
    window.location.href = url;
  };

  return (
    <div className="space-y-3">
      {PROVIDERS.map((provider) => (
        <button
          key={provider.id}
          onClick={() => handleSocialLogin(provider.id)}
          disabled={loading !== null}
          className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border ${provider.bgColor} ${provider.textColor} ${provider.borderColor} font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading === provider.id ? (
            <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            provider.icon
          )}
          <span>Continue with {provider.name}</span>
        </button>
      ))}
    </div>
  );
}

export function SocialLoginDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-surface-200" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-white text-surface-500">or continue with email</span>
      </div>
    </div>
  );
}
