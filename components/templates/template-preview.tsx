"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Template } from "@/types";
import {
  Star,
  Crown,
  ChevronLeft,
  ChevronRight,
  Palette,
  Type,
  Layout,
} from "lucide-react";

interface TemplatePreviewDialogProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (template: Template) => void;
}

export function TemplatePreviewDialog({
  template,
  open,
  onOpenChange,
  onSelect,
}: TemplatePreviewDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  if (!template) return null;

  const allImages = [template.thumbnail, ...template.previewImages];
  const hasMultipleImages = allImages.length > 1;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleSelect = () => {
    onSelect?.(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{template.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {template.description}
              </DialogDescription>
            </div>
            {template.isPremium && (
              <Badge className="bg-amber-500 text-white border-0">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Preview */}
            <div className="relative">
              <div className="relative aspect-[3/4] bg-surface-100 rounded-lg overflow-hidden">
                {!imageError ? (
                  <Image
                    src={allImages[currentImageIndex]}
                    alt={`${template.name} preview ${currentImageIndex + 1}`}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: template.design.backgroundColor }}
                  >
                    <span className="text-surface-500">Preview not available</span>
                  </div>
                )}

                {/* Image Navigation */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Image Indicators */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {allImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={cn(
                            "w-2 h-2 rounded-full transition-colors",
                            idx === currentImageIndex
                              ? "bg-white"
                              : "bg-white/50 hover:bg-white/75"
                          )}
                          aria-label={`View image ${idx + 1}`}
                          aria-current={idx === currentImageIndex ? "true" : undefined}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Template Details */}
            <div className="space-y-4">
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-4 h-4",
                        star <= Math.round(template.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-surface-200 text-surface-200"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{template.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({template.reviewCount} reviews)
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Design Details */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="text-sm font-medium">Design Details</h4>

                {/* Colors */}
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Colors:</span>
                  <div className="flex gap-1">
                    <div
                      className="w-5 h-5 rounded border"
                      style={{ backgroundColor: template.design.primaryColor }}
                      title="Primary"
                    />
                    <div
                      className="w-5 h-5 rounded border"
                      style={{ backgroundColor: template.design.secondaryColor }}
                      title="Secondary"
                    />
                    <div
                      className="w-5 h-5 rounded border"
                      style={{ backgroundColor: template.design.accentColor }}
                      title="Accent"
                    />
                    <div
                      className="w-5 h-5 rounded border"
                      style={{ backgroundColor: template.design.backgroundColor }}
                      title="Background"
                    />
                  </div>
                </div>

                {/* Fonts */}
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Fonts:</span>
                  <span className="text-sm">
                    {template.design.headingFont}, {template.design.fontFamily}
                  </span>
                </div>

                {/* Layout */}
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Layout:</span>
                  <span className="text-sm capitalize">{template.design.layout}</span>
                </div>

                {/* Dimensions */}
                <div className="text-sm text-muted-foreground">
                  {template.design.width} x {template.design.height}px
                </div>
              </div>

              {/* Price */}
              {template.isPremium && template.price && (
                <div className="pt-4 border-t">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      ${template.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">one-time</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSelect}>
            {template.isPremium ? "Purchase & Use" : "Use This Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Inline preview component (non-dialog)
interface TemplatePreviewInlineProps {
  template: Template;
  className?: string;
}

export function TemplatePreviewInline({
  template,
  className,
}: TemplatePreviewInlineProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Preview Image */}
      <div className="relative aspect-[3/4] bg-surface-100 rounded-lg overflow-hidden">
        {!imageError ? (
          <Image
            src={template.thumbnail}
            alt={template.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: template.design.backgroundColor }}
          />
        )}
      </div>

      {/* Info */}
      <div>
        <h4 className="font-medium">{template.name}</h4>
        <p className="text-sm text-muted-foreground">{template.description}</p>
      </div>

      {/* Color Palette */}
      <div className="flex gap-1">
        <div
          className="flex-1 h-6 rounded"
          style={{ backgroundColor: template.design.primaryColor }}
        />
        <div
          className="flex-1 h-6 rounded"
          style={{ backgroundColor: template.design.secondaryColor }}
        />
        <div
          className="flex-1 h-6 rounded"
          style={{ backgroundColor: template.design.accentColor }}
        />
      </div>
    </div>
  );
}
