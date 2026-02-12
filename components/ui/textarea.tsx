"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  success?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      error,
      success,
      showCharCount,
      maxLength,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[120px] w-full rounded-xl border bg-white px-4 py-3",
            "text-surface-900 font-body text-base transition-colors duration-200",
            "placeholder:text-surface-400",
            "hover:border-surface-400",
            "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-100",
            "resize-y",
            error && "border-error-500 focus:border-error-500 focus:ring-error-500/20",
            success && "border-success-500 focus:border-success-500 focus:ring-success-500/20",
            !error && !success && "border-surface-300",
            className
          )}
          ref={ref}
          disabled={disabled}
          value={value}
          maxLength={maxLength}
          {...props}
        />

        {/* Character count */}
        {showCharCount && maxLength && (
          <div className="absolute bottom-3 right-3 text-xs text-surface-400">
            <span className={charCount >= maxLength ? "text-error-500" : ""}>
              {charCount}
            </span>
            /{maxLength}
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="mt-2 text-sm text-error-600 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        {/* Success message */}
        {success && (
          <p className="mt-2 text-sm text-success-600 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {success}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
