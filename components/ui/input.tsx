"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      success,
      leftIcon,
      rightIcon,
      showPasswordToggle,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-surface-700 mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input field */}
          <input
            id={inputId}
            type={inputType}
            className={cn(
              "flex h-12 w-full rounded-xl border bg-white px-4 py-3",
              "text-surface-900 font-body text-base transition-colors duration-200",
              "placeholder:text-surface-400",
              "hover:border-surface-400",
              "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-100",
              leftIcon && "pl-12",
              (rightIcon || (isPassword && showPasswordToggle) || error || success) && "pr-12",
              error && "border-error-500 focus:border-error-500 focus:ring-error-500/20",
              success && "border-success-500 focus:border-success-500 focus:ring-success-500/20",
              !error && !success && "border-surface-300",
              className
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />

          {/* Right side icons */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Status icons */}
          {error && !isPassword && (
            <AlertCircle className="h-5 w-5 text-error-500" />
          )}
          {success && !isPassword && (
            <CheckCircle2 className="h-5 w-5 text-success-500" />
          )}

          {/* Custom right icon */}
          {rightIcon && !isPassword && (
            <span className="text-surface-400">{rightIcon}</span>
          )}

          {/* Password toggle */}
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-surface-400 hover:text-surface-600 transition-colors p-1 -m-1"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
          </div>
        </div>

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

Input.displayName = "Input";

export { Input };
