"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Search,
  Upload,
  Image as ImageIcon,
  Grid,
  List,
  Check,
  Trash2,
  ExternalLink,
} from "lucide-react";

export interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  name: string;
  type: "image" | "video";
  size?: number;
  createdAt?: Date;
}

interface MediaGalleryProps {
  items: MediaItem[];
  selectedId?: string;
  onSelect?: (item: MediaItem) => void;
  onDelete?: (itemId: string) => void;
  onUpload?: () => void;
  loading?: boolean;
  className?: string;
}

export function MediaGallery({
  items,
  selectedId,
  onSelect,
  onDelete,
  onUpload,
  loading = false,
  className,
}: MediaGalleryProps) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === "grid" ? "primary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "primary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        {onUpload && (
          <Button onClick={onUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-surface-100 dark:bg-surface-900 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            {search ? "No media found" : "No media uploaded yet"}
          </p>
          {onUpload && !search && (
            <Button variant="outline" size="sm" className="mt-4" onClick={onUpload}>
              <Upload className="h-4 w-4 mr-2" />
              Upload your first image
            </Button>
          )}
        </div>
      )}

      {/* Grid View */}
      {!loading && viewMode === "grid" && filteredItems.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {filteredItems.map((item) => (
            <MediaGridItem
              key={item.id}
              item={item}
              selected={selectedId === item.id}
              onSelect={() => onSelect?.(item)}
              onPreview={() => setPreviewItem(item)}
              onDelete={onDelete ? () => onDelete(item.id) : undefined}
            />
          ))}
        </div>
      )}

      {/* List View */}
      {!loading && viewMode === "list" && filteredItems.length > 0 && (
        <div className="border rounded-lg divide-y">
          {filteredItems.map((item) => (
            <MediaListItem
              key={item.id}
              item={item}
              selected={selectedId === item.id}
              onSelect={() => onSelect?.(item)}
              onPreview={() => setPreviewItem(item)}
              onDelete={onDelete ? () => onDelete(item.id) : undefined}
            />
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.name}</DialogTitle>
          </DialogHeader>
          {previewItem && (
            <div className="space-y-4">
              <img
                src={previewItem.url}
                alt={previewItem.name}
                className="w-full rounded-lg"
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {previewItem.size
                    ? `${(previewItem.size / 1024 / 1024).toFixed(2)} MB`
                    : ""}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(previewItem.url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                  {onSelect && (
                    <Button
                      size="sm"
                      onClick={() => {
                        onSelect(previewItem);
                        setPreviewItem(null);
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Select
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Grid Item Component
interface MediaItemProps {
  item: MediaItem;
  selected?: boolean;
  onSelect?: () => void;
  onPreview?: () => void;
  onDelete?: () => void;
}

function MediaGridItem({
  item,
  selected,
  onSelect,
  onPreview,
  onDelete,
}: MediaItemProps) {
  return (
    <div
      className={cn(
        "group relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-primary/50"
      )}
      onClick={onSelect}
    >
      <img
        src={item.thumbnailUrl || item.url}
        alt={item.name}
        className="w-full h-full object-cover"
      />

      {/* Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 flex items-center justify-center gap-2 transition-opacity",
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        {selected && <Check className="h-6 w-6 text-white" />}
        {onPreview && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:text-destructive hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function MediaListItem({
  item,
  selected,
  onSelect,
  onPreview,
  onDelete,
}: MediaItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-3 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-900",
        selected && "bg-primary/5"
      )}
      onClick={onSelect}
    >
      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
        <img
          src={item.thumbnailUrl || item.url}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          {item.size ? `${(item.size / 1024 / 1024).toFixed(2)} MB` : "Image"}
        </p>
      </div>
      {selected && <Check className="h-5 w-5 text-primary shrink-0" />}
      <div className="flex gap-1">
        {onPreview && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Media Picker Dialog
interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  onUpload?: () => void;
}

export function MediaPicker({
  open,
  onOpenChange,
  items,
  onSelect,
  onUpload,
}: MediaPickerProps) {
  const handleSelect = (item: MediaItem) => {
    onSelect(item);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <MediaGallery
            items={items}
            onSelect={handleSelect}
            onUpload={onUpload}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
