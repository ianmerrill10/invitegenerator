"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  required?: boolean;
  optional?: boolean;
  description?: string;
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, children, required, optional, description, ...props }, ref) => (
  <div className="flex flex-col gap-1">
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        "text-sm font-medium text-surface-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-error-500 ml-1">*</span>}
      {optional && (
        <span className="text-surface-400 text-xs font-normal ml-2">
          (optional)
        </span>
      )}
    </LabelPrimitive.Root>
    {description && (
      <p className="text-xs text-surface-500">{description}</p>
    )}
  </div>
));

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
