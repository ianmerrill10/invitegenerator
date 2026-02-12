"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  color?: "brand" | "white" | "surface";
}

const sizeClasses = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const colorClasses = {
  brand: "text-brand-500",
  white: "text-white",
  surface: "text-surface-400",
};

export function Spinner({ size = "md", className, color = "brand" }: SpinnerProps) {
  return (
    <Loader2
      className={cn(
        "animate-spin",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      aria-hidden="true"
    />
  );
}

// Full page loading spinner
interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export function LoadingOverlay({ message, className }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message || "Loading"}
    >
      <Spinner size="xl" />
      {message && (
        <p className="mt-4 text-sm font-medium text-surface-600">{message}</p>
      )}
    </div>
  );
}

// Inline loading spinner with text
interface LoadingInlineProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingInline({ message = "Loading...", size = "md", className }: LoadingInlineProps) {
  const spinnerSize = size === "sm" ? "xs" : size === "lg" ? "md" : "sm";
  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  return (
    <div className={cn("flex items-center gap-2", className)} role="status" aria-live="polite">
      <Spinner size={spinnerSize} />
      <span className={cn("text-surface-500", textSize)}>{message}</span>
    </div>
  );
}
