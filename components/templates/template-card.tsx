"use client";

import { useState, memo, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Template } from "@/types";
import { Star, Eye, Crown, Check } from "lucide-react";

interface TemplateCardProps {
  template: Template;
  onSelect?: (template: Template) => void;
  onPreview?: (template: Template) => void;
  isSelected?: boolean;
  showActions?: boolean;
  className?: string;
}

export const TemplateCard = memo(function TemplateCard({
  template,
  onSelect,
  onPreview,
  isSelected = false,
  showActions = true,
  className,
}: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleSelect = useCallback(() => {
    if (onSelect) {
      onSelect(template);
    }
  }, [onSelect, template]);

  const handlePreview = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPreview) {
      onPreview(template);
    }
  }, [onPreview, template]);

  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-card overflow-hidden transition-all duration-200",
        isSelected ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/50",
        "hover:shadow-lg cursor-pointer",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSelect}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[3/4] bg-surface-100 overflow-hidden">
        {!imageError ? (
          <Image
            src={template.thumbnail}
            alt={template.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: template.design.backgroundColor }}
          >
            <span className="text-sm text-surface-500">Preview</span>
          </div>
        )}

        {/* Premium Badge */}
        {template.isPremium && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-amber-500 text-white border-0">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>
        )}

        {/* Selected Indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        {isHovered && showActions && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              onClick={handlePreview}
              className="bg-white hover:bg-white/90"
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
            <Button size="sm" onClick={handleSelect}>
              Use Template
            </Button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm truncate">{template.name}</h3>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {template.description}
        </p>

        {/* Rating & Stats */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium">{template.rating}</span>
            <span className="text-xs text-muted-foreground">
              ({template.reviewCount})
            </span>
          </div>
          {template.isPremium && template.price && (
            <span className="text-xs font-semibold text-primary">
              ${template.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {template.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[10px] px-1.5 py-0"
              >
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

// Compact version for smaller displays
interface TemplateCardCompactProps {
  template: Template;
  onSelect?: (template: Template) => void;
  isSelected?: boolean;
  className?: string;
}

export const TemplateCardCompact = memo(function TemplateCardCompact({
  template,
  onSelect,
  isSelected = false,
  className,
}: TemplateCardCompactProps) {
  const [imageError, setImageError] = useState(false);

  const handleSelect = useCallback(() => {
    onSelect?.(template);
  }, [onSelect, template]);

  return (
    <div
      className={cn(
        "relative rounded-md border overflow-hidden transition-all cursor-pointer",
        isSelected ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/50",
        className
      )}
      onClick={handleSelect}
    >
      <div className="relative aspect-[3/4] bg-surface-100">
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
        {isSelected && (
          <div className="absolute top-1 right-1">
            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          </div>
        )}
        {template.isPremium && (
          <div className="absolute top-1 left-1">
            <Crown className="w-3 h-3 text-amber-500" />
          </div>
        )}
      </div>
      <div className="p-1.5">
        <p className="text-xs font-medium truncate">{template.name}</p>
      </div>
    </div>
  );
});
