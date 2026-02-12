"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { AlertTriangle, RefreshCcw, Home, Bug } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  className?: string;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by ErrorBoundary:", error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          className={this.props.className}
        />
      );
    }

    return this.props.children;
  }
}

// Error fallback component
interface ErrorFallbackProps {
  error?: Error | null;
  onRetry?: () => void;
  onGoHome?: () => void;
  showDetails?: boolean;
  className?: string;
}

export function ErrorFallback({
  error,
  onRetry,
  onGoHome,
  showDetails = process.env.NODE_ENV === "development",
  className,
}: ErrorFallbackProps) {
  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[400px] p-8 text-center",
        className
      )}
    >
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>

      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        We encountered an unexpected error. Please try again or return to the
        dashboard.
      </p>

      <div className="flex items-center gap-3 mb-6">
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
        <Button variant="outline" onClick={handleGoHome}>
          <Home className="h-4 w-4 mr-2" />
          Go to Dashboard
        </Button>
      </div>

      {showDetails && error && (
        <details className="w-full max-w-lg text-left">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Technical Details
          </summary>
          <div className="mt-3 p-4 bg-surface-100 dark:bg-surface-900 rounded-lg overflow-auto">
            <p className="text-sm font-mono text-destructive mb-2">
              {error.name}: {error.message}
            </p>
            {error.stack && (
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                {error.stack}
              </pre>
            )}
          </div>
        </details>
      )}
    </div>
  );
}

// Page-level error component
interface PageErrorProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function PageError({
  title = "Page Not Found",
  description = "The page you're looking for doesn't exist or has been moved.",
  onRetry,
  className,
}: PageErrorProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[50vh] p-8 text-center",
        className
      )}
    >
      <div className="w-24 h-24 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-6">
        <span className="text-4xl font-bold text-muted-foreground">404</span>
      </div>

      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>

      <div className="flex items-center gap-3">
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/dashboard")}
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

// API Error component
interface ApiErrorProps {
  message?: string;
  statusCode?: number;
  onRetry?: () => void;
  className?: string;
}

export function ApiError({
  message = "Failed to load data",
  statusCode,
  onRetry,
  className,
}: ApiErrorProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>

      <h3 className="text-lg font-semibold mb-2">
        {statusCode ? `Error ${statusCode}` : "Error"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mb-4">{message}</p>

      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}
