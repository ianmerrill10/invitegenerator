"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplateCard } from "./template-card";
import { TemplatePreviewDialog } from "./template-preview";
import {
  templates,
  templateCategories,
  getTemplatesByCategory,
  getFreeTemplates,
  getPremiumTemplates,
  getPopularTemplates,
  searchTemplates,
} from "@/lib/data/templates";
import type { Template, EventType } from "@/types";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  Grid2X2,
  LayoutList,
  Crown,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface TemplateGalleryProps {
  onSelectTemplate?: (template: Template) => void;
  selectedTemplateId?: string;
  filterCategory?: EventType;
  showFilters?: boolean;
  showSearch?: boolean;
  columns?: 2 | 3 | 4;
  className?: string;
}

type ViewMode = "grid-3" | "grid-2" | "list";
type FilterTab = "all" | "popular" | "free" | "premium" | EventType;

export function TemplateGallery({
  onSelectTemplate,
  selectedTemplateId,
  filterCategory,
  showFilters = true,
  showSearch = true,
  columns = 3,
  className,
}: TemplateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>(filterCategory || "all");
  const [viewMode, setViewMode] = useState<ViewMode>(`grid-${columns}` as ViewMode);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // Filter and search templates
  const filteredTemplates = useMemo(() => {
    let result: Template[] = [];

    // Apply category/type filter
    switch (activeTab) {
      case "all":
        result = [...templates];
        break;
      case "popular":
        result = getPopularTemplates(20);
        break;
      case "free":
        result = getFreeTemplates();
        break;
      case "premium":
        result = getPremiumTemplates();
        break;
      default:
        result = getTemplatesByCategory(activeTab);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const searchResults = searchTemplates(searchQuery);
      result = result.filter((t) =>
        searchResults.some((sr) => sr.id === t.id)
      );
    }

    return result;
  }, [activeTab, searchQuery]);

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate?.(template);
  };

  const handlePreviewTemplate = (template: Template) => {
    setPreviewTemplate(template);
  };

  const gridClass = useMemo(() => {
    switch (viewMode) {
      case "grid-2":
        return "grid-cols-1 sm:grid-cols-2";
      case "grid-3":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case "list":
        return "grid-cols-1";
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    }
  }, [viewMode]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and View Controls */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {showFilters && (
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid-3" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid-3")}
                className="h-9 w-9"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid-2" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid-2")}
                className="h-9 w-9"
              >
                <Grid2X2 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="h-9 w-9"
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      {showFilters && !filterCategory && (
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as FilterTab)}
        >
          <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              All
            </TabsTrigger>
            <TabsTrigger
              value="popular"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              Popular
            </TabsTrigger>
            <TabsTrigger
              value="free"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Free
            </TabsTrigger>
            <TabsTrigger
              value="premium"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Crown className="h-3.5 w-3.5 mr-1" />
              Premium
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Category Pills */}
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          {templateCategories.map((category) => (
            <Badge
              key={category.id}
              variant={activeTab === category.id ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => setActiveTab(category.id)}
            >
              {category.name}
              <span className="ml-1 text-xs opacity-70">
                ({category.templateCount})
              </span>
            </Badge>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""} found
      </div>

      {/* Template Grid */}
      {filteredTemplates.length > 0 ? (
        <div className={cn("grid gap-4", gridClass)}>
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={handleSelectTemplate}
              onPreview={handlePreviewTemplate}
              isSelected={selectedTemplateId === template.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No templates found matching your criteria.
          </p>
          <Button
            variant="link"
            onClick={() => {
              setSearchQuery("");
              setActiveTab("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Preview Dialog */}
      <TemplatePreviewDialog
        template={previewTemplate}
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
        onSelect={handleSelectTemplate}
      />
    </div>
  );
}

// Simplified gallery for wizard/selection
interface TemplateSelectionGalleryProps {
  category?: EventType;
  selectedTemplateId?: string;
  onSelect: (template: Template) => void;
  className?: string;
}

export function TemplateSelectionGallery({
  category,
  selectedTemplateId,
  onSelect,
  className,
}: TemplateSelectionGalleryProps) {
  const displayTemplates = useMemo(() => {
    if (category) {
      return getTemplatesByCategory(category);
    }
    return getPopularTemplates(12);
  }, [category]);

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3", className)}>
      {displayTemplates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onSelect={onSelect}
          isSelected={selectedTemplateId === template.id}
          showActions={false}
        />
      ))}
    </div>
  );
}
