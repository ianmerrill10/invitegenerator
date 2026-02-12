"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Search,
  Star,
  Heart,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Sparkles,
  Flower2,
  Crown,
  Gift,
  Cake,
  PartyPopper,
  Music,
  Camera,
  MapPin,
  Calendar,
  Clock,
  Mail,
  Phone,
  Globe,
  ArrowRight,
  ChevronRight,
  Plus,
  Minus,
  X,
  Check,
  Lock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as Tabs from "@radix-ui/react-tabs";
import type { LibraryCategory, LibraryItem, ElementType } from "@/types";

interface ElementLibraryProps {
  onSelectElement: (item: LibraryItem) => void;
  className?: string;
}

// Pre-defined library items
const LIBRARY_ITEMS: LibraryItem[] = [
  // Shapes
  { id: "shape-circle", name: "Circle", category: "shapes", type: "shape", content: "circle", tags: ["basic", "round"], isPremium: false },
  { id: "shape-square", name: "Square", category: "shapes", type: "shape", content: "square", tags: ["basic", "rectangle"], isPremium: false },
  { id: "shape-triangle", name: "Triangle", category: "shapes", type: "shape", content: "triangle", tags: ["basic", "polygon"], isPremium: false },
  { id: "shape-hexagon", name: "Hexagon", category: "shapes", type: "shape", content: "hexagon", tags: ["polygon"], isPremium: false },
  { id: "shape-star", name: "Star", category: "shapes", type: "shape", content: "star", tags: ["decorative"], isPremium: false },
  { id: "shape-heart", name: "Heart", category: "shapes", type: "shape", content: "heart", tags: ["love", "romantic"], isPremium: false },

  // Icons - Events
  { id: "icon-cake", name: "Cake", category: "icons", subcategory: "events", type: "icon", content: "Cake", tags: ["birthday", "celebration"], isPremium: false },
  { id: "icon-party", name: "Party Popper", category: "icons", subcategory: "events", type: "icon", content: "PartyPopper", tags: ["celebration", "party"], isPremium: false },
  { id: "icon-gift", name: "Gift", category: "icons", subcategory: "events", type: "icon", content: "Gift", tags: ["present", "birthday"], isPremium: false },
  { id: "icon-crown", name: "Crown", category: "icons", subcategory: "events", type: "icon", content: "Crown", tags: ["royal", "king", "queen"], isPremium: false },
  { id: "icon-music", name: "Music", category: "icons", subcategory: "events", type: "icon", content: "Music", tags: ["party", "dance"], isPremium: false },
  { id: "icon-camera", name: "Camera", category: "icons", subcategory: "events", type: "icon", content: "Camera", tags: ["photo", "picture"], isPremium: false },

  // Icons - Info
  { id: "icon-mappin", name: "Location", category: "icons", subcategory: "info", type: "icon", content: "MapPin", tags: ["location", "venue"], isPremium: false },
  { id: "icon-calendar", name: "Calendar", category: "icons", subcategory: "info", type: "icon", content: "Calendar", tags: ["date", "schedule"], isPremium: false },
  { id: "icon-clock", name: "Clock", category: "icons", subcategory: "info", type: "icon", content: "Clock", tags: ["time", "schedule"], isPremium: false },
  { id: "icon-mail", name: "Mail", category: "icons", subcategory: "info", type: "icon", content: "Mail", tags: ["email", "contact"], isPremium: false },
  { id: "icon-phone", name: "Phone", category: "icons", subcategory: "info", type: "icon", content: "Phone", tags: ["call", "contact"], isPremium: false },
  { id: "icon-globe", name: "Globe", category: "icons", subcategory: "info", type: "icon", content: "Globe", tags: ["website", "online"], isPremium: false },

  // Stickers - Wedding
  { id: "sticker-rings", name: "Wedding Rings", category: "stickers", subcategory: "wedding", type: "image", content: "/stickers/wedding-rings.svg", tags: ["wedding", "marriage"], isPremium: false },
  { id: "sticker-bells", name: "Wedding Bells", category: "stickers", subcategory: "wedding", type: "image", content: "/stickers/wedding-bells.svg", tags: ["wedding", "ceremony"], isPremium: true },
  { id: "sticker-bouquet", name: "Bouquet", category: "stickers", subcategory: "wedding", type: "image", content: "/stickers/bouquet.svg", tags: ["wedding", "flowers"], isPremium: true },

  // Stickers - Birthday
  { id: "sticker-balloon", name: "Balloon", category: "stickers", subcategory: "birthday", type: "image", content: "/stickers/balloon.svg", tags: ["birthday", "party"], isPremium: false },
  { id: "sticker-confetti", name: "Confetti", category: "stickers", subcategory: "birthday", type: "image", content: "/stickers/confetti.svg", tags: ["party", "celebration"], isPremium: false },
  { id: "sticker-banner", name: "Banner", category: "stickers", subcategory: "birthday", type: "image", content: "/stickers/banner.svg", tags: ["birthday", "celebration"], isPremium: true },

  // Decorations
  { id: "decor-sparkle", name: "Sparkle", category: "decorations", type: "icon", content: "Sparkles", tags: ["sparkle", "shine"], isPremium: false },
  { id: "decor-flower", name: "Flower", category: "decorations", type: "icon", content: "Flower2", tags: ["floral", "nature"], isPremium: false },
  { id: "decor-star", name: "Star", category: "decorations", type: "icon", content: "Star", tags: ["star", "shine"], isPremium: false },

  // Dividers
  { id: "divider-line", name: "Simple Line", category: "dividers", type: "divider", content: "line", tags: ["simple", "minimal"], isPremium: false },
  { id: "divider-dots", name: "Dotted Line", category: "dividers", type: "divider", content: "dots", tags: ["dotted"], isPremium: false },
  { id: "divider-ornate", name: "Ornate Divider", category: "dividers", type: "divider", content: "ornate", tags: ["fancy", "decorative"], isPremium: true },
  { id: "divider-flourish", name: "Flourish", category: "dividers", type: "divider", content: "flourish", tags: ["elegant", "decorative"], isPremium: true },

  // Borders
  { id: "border-simple", name: "Simple Border", category: "borders", type: "shape", content: "border-simple", tags: ["frame", "simple"], isPremium: false },
  { id: "border-double", name: "Double Border", category: "borders", type: "shape", content: "border-double", tags: ["frame", "elegant"], isPremium: false },
  { id: "border-ornate", name: "Ornate Border", category: "borders", type: "shape", content: "border-ornate", tags: ["frame", "decorative"], isPremium: true },
  { id: "border-floral", name: "Floral Border", category: "borders", type: "shape", content: "border-floral", tags: ["frame", "flowers"], isPremium: true },
];

const CATEGORIES: { id: LibraryCategory; label: string; icon: React.ElementType }[] = [
  { id: "shapes", label: "Shapes", icon: Square },
  { id: "icons", label: "Icons", icon: Star },
  { id: "stickers", label: "Stickers", icon: Sparkles },
  { id: "decorations", label: "Decor", icon: Flower2 },
  { id: "dividers", label: "Dividers", icon: Minus },
  { id: "borders", label: "Borders", icon: Square },
];

// Icon mapping for rendering
const ICON_MAP: Record<string, React.ElementType> = {
  Star,
  Heart,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Sparkles,
  Flower2,
  Crown,
  Gift,
  Cake,
  PartyPopper,
  Music,
  Camera,
  MapPin,
  Calendar,
  Clock,
  Mail,
  Phone,
  Globe,
  ArrowRight,
  ChevronRight,
  Plus,
  Minus,
  X,
  Check,
};

export function ElementLibrary({ onSelectElement, className = "" }: ElementLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<LibraryCategory>("shapes");

  const filteredItems = useMemo(() => {
    let items = LIBRARY_ITEMS.filter((item) => item.category === activeCategory);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return items;
  }, [activeCategory, searchQuery]);

  const handleSelectItem = (item: LibraryItem) => {
    if (item.isPremium) {
      toast.error("This is a premium element. Please upgrade to use it.");
      return;
    }
    onSelectElement(item);
  };

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {/* Search */}
      <div className="border-b border-surface-200 p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <Input
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs.Root value={activeCategory} onValueChange={(v) => setActiveCategory(v as LibraryCategory)}>
        <Tabs.List className="flex gap-1 overflow-x-auto border-b border-surface-200 px-2 py-2">
          {CATEGORIES.map((category) => (
            <Tabs.Trigger
              key={category.id}
              value={category.id}
              className={`
                flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors
                data-[state=active]:bg-brand-100 data-[state=active]:text-brand-700
                data-[state=inactive]:text-surface-600 data-[state=inactive]:hover:bg-surface-100
              `}
            >
              <category.icon className="h-3.5 w-3.5" />
              {category.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Search className="mb-2 h-8 w-8 text-surface-300" />
              <p className="text-sm text-surface-500">No elements found</p>
              <p className="text-xs text-surface-400">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filteredItems.map((item) => (
                <ElementItem
                  key={item.id}
                  item={item}
                  onClick={() => handleSelectItem(item)}
                />
              ))}
            </div>
          )}
        </div>
      </Tabs.Root>
    </div>
  );
}

// Individual element item component
function ElementItem({ item, onClick }: { item: LibraryItem; onClick: () => void }) {
  const IconComponent = ICON_MAP[item.content] || Square;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        group relative flex aspect-square flex-col items-center justify-center rounded-lg border
        transition-colors
        ${item.isPremium
          ? "border-amber-200 bg-amber-50 hover:border-amber-300"
          : "border-surface-200 bg-white hover:border-brand-300 hover:bg-brand-50"
        }
      `}
    >
      {/* Premium Badge */}
      {item.isPremium && (
        <div className="absolute right-1 top-1">
          <Lock className="h-3 w-3 text-amber-500" />
        </div>
      )}

      {/* Element Preview */}
      <div className="mb-1.5">
        {item.type === "icon" || item.type === "shape" ? (
          <IconComponent className={`h-8 w-8 ${item.isPremium ? "text-amber-500" : "text-surface-600 group-hover:text-brand-600"}`} />
        ) : item.type === "divider" ? (
          <DividerPreview type={item.content} isPremium={item.isPremium} />
        ) : (
          <div className="h-8 w-8 rounded bg-surface-200" />
        )}
      </div>

      {/* Label */}
      <span className={`text-[10px] font-medium ${item.isPremium ? "text-amber-600" : "text-surface-600"}`}>
        {item.name}
      </span>
    </motion.button>
  );
}

// Divider preview component
function DividerPreview({ type, isPremium }: { type: string; isPremium: boolean }) {
  const colorClass = isPremium ? "bg-amber-400" : "bg-surface-400";
  const flourishClass = isPremium ? "via-amber-400" : "via-surface-400";

  switch (type) {
    case "dots":
      return (
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-1.5 w-1.5 rounded-full ${colorClass}`} />
          ))}
        </div>
      );
    case "ornate":
      return (
        <div className="flex items-center gap-1">
          <div className={`h-0.5 w-4 ${colorClass}`} />
          <div className={`h-2 w-2 rotate-45 ${colorClass}`} />
          <div className={`h-0.5 w-4 ${colorClass}`} />
        </div>
      );
    case "flourish":
      return (
        <div className="flex items-center">
          <div className={`h-0.5 w-8 rounded-full bg-gradient-to-r from-transparent ${flourishClass} to-transparent`} />
        </div>
      );
    default:
      return <div className={`h-0.5 w-12 ${colorClass}`} />;
  }
}

// Compact sidebar version
export function ElementLibrarySidebar({ onSelectElement, className = "" }: ElementLibraryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-10 w-10"
      >
        <Plus className="h-5 w-5" />
      </Button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="absolute left-full top-0 z-50 ml-2 w-72 rounded-lg border border-surface-200 bg-white shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-surface-200 px-3 py-2">
            <span className="text-sm font-medium">Element Library</span>
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="h-6 w-6" aria-label="Close element library">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-80">
            <ElementLibrary onSelectElement={(item) => {
              onSelectElement(item);
              setIsExpanded(false);
            }} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
