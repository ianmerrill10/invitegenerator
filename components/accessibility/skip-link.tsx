"use client";

import { cn } from "@/lib/utils";

interface SkipLinkProps {
  href?: string;
  className?: string;
}

/**
 * Skip to main content link for keyboard navigation
 * Visible only when focused for screen reader users
 */
export function SkipLink({ href = "#main-content", className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only",
        "focus:absolute focus:top-4 focus:left-4 focus:z-[100]",
        "focus:px-4 focus:py-2 focus:rounded-lg",
        "focus:bg-brand-600 focus:text-white",
        "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
        "font-medium text-sm transition-all",
        className
      )}
    >
      Skip to main content
    </a>
  );
}

/**
 * Skip links for multiple landmarks
 */
export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <div className="fixed top-0 left-0 z-[100] p-4 flex gap-2">
        <a
          href="#main-content"
          className="px-4 py-2 rounded-lg bg-brand-600 text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <a
          href="#main-nav"
          className="px-4 py-2 rounded-lg bg-surface-700 text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-surface-500 focus:ring-offset-2"
        >
          Skip to navigation
        </a>
      </div>
    </div>
  );
}
