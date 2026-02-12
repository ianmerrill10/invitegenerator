"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

interface LoadingOverlayProps {
  text?: string;
  transparent?: boolean;
}

export function LoadingOverlay({ text, transparent }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center z-50",
        transparent ? "bg-background/50" : "bg-background/80",
        "backdrop-blur-sm"
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    </div>
  );
}

interface LoadingPageProps {
  text?: string;
}

export function LoadingPage({ text = "Loading..." }: LoadingPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="xl" />
        <p className="text-lg text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-6 flex items-center justify-center min-h-[200px]",
        className
      )}
    >
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}

interface LoadingButtonContentProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export function LoadingButtonContent({
  loading,
  children,
  loadingText,
}: LoadingButtonContentProps) {
  if (loading) {
    return (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {loadingText || "Loading..."}
      </>
    );
  }
  return <>{children}</>;
}

interface LoadingDotsProps {
  className?: string;
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="animate-bounce delay-0 h-1.5 w-1.5 rounded-full bg-current" />
      <span className="animate-bounce delay-150 h-1.5 w-1.5 rounded-full bg-current" />
      <span className="animate-bounce delay-300 h-1.5 w-1.5 rounded-full bg-current" />
    </span>
  );
}

interface LoadingPulseProps {
  lines?: number;
  className?: string;
}

export function LoadingPulse({ lines = 3, className }: LoadingPulseProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 bg-muted rounded animate-pulse",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

interface LoadingTableRowsProps {
  rows?: number;
  columns?: number;
}

export function LoadingTableRows({ rows = 5, columns = 4 }: LoadingTableRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-4 py-3">
              <div
                className={cn(
                  "h-4 bg-muted rounded",
                  colIndex === 0 ? "w-32" : colIndex === columns - 1 ? "w-16" : "w-24"
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

interface LoadingGridCardsProps {
  count?: number;
  columns?: 2 | 3 | 4;
}

export function LoadingGridCards({ count = 6, columns = 3 }: LoadingGridCardsProps) {
  const gridClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridClasses[columns])}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card overflow-hidden animate-pulse">
          <div className="h-40 bg-muted" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface InlineLoadingProps {
  text?: string;
}

export function InlineLoading({ text = "Loading" }: InlineLoadingProps) {
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      {text}
      <LoadingDots />
    </span>
  );
}

// Progress-based loading
interface LoadingProgressProps {
  progress: number;
  text?: string;
}

export function LoadingProgress({ progress, text }: LoadingProgressProps) {
  return (
    <div className="w-full max-w-md space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{text || "Loading..."}</span>
        <span className="text-foreground font-medium">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default LoadingSpinner;
