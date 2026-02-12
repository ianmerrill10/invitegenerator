"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// Using a simple scrollable div instead of ScrollArea
import { Search, Check, ChevronDown } from "lucide-react";

// Font categories and definitions
export const fontCategories = {
  serif: {
    name: "Serif",
    fonts: [
      "Georgia",
      "Times New Roman",
      "Playfair Display",
      "Merriweather",
      "Lora",
      "Crimson Text",
      "EB Garamond",
      "Cormorant Garamond",
      "Libre Baskerville",
      "Spectral",
    ],
  },
  "sans-serif": {
    name: "Sans Serif",
    fonts: [
      "Arial",
      "Helvetica",
      "Inter",
      "Roboto",
      "Open Sans",
      "Montserrat",
      "Poppins",
      "Raleway",
      "Nunito",
      "DM Sans",
      "Work Sans",
      "Source Sans Pro",
    ],
  },
  display: {
    name: "Display",
    fonts: [
      "Bebas Neue",
      "Oswald",
      "Anton",
      "Archivo Black",
      "Fjalla One",
      "Passion One",
      "Righteous",
      "Fredoka One",
      "Bangers",
      "Permanent Marker",
    ],
  },
  handwriting: {
    name: "Handwriting",
    fonts: [
      "Dancing Script",
      "Pacifico",
      "Great Vibes",
      "Sacramento",
      "Satisfy",
      "Caveat",
      "Kalam",
      "Amatic SC",
      "Shadows Into Light",
      "Indie Flower",
    ],
  },
  monospace: {
    name: "Monospace",
    fonts: [
      "Courier New",
      "Fira Code",
      "JetBrains Mono",
      "Source Code Pro",
      "IBM Plex Mono",
      "Space Mono",
      "Roboto Mono",
    ],
  },
};

// Flatten all fonts for search
const allFonts = Object.values(fontCategories).flatMap(
  (category) => category.fonts
);

interface FontPickerProps {
  value: string;
  onChange: (font: string) => void;
  label?: string;
  className?: string;
}

export function FontPicker({
  value,
  onChange,
  label,
  className,
}: FontPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredFonts = useMemo(() => {
    if (!search.trim()) {
      return null; // Show categories
    }
    return allFonts.filter((font) =>
      font.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleSelectFont = (font: string) => {
    onChange(font);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label className="text-xs">{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-9"
            role="combobox"
          >
            <span style={{ fontFamily: value }} className="truncate">
              {value}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search fonts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
          </div>

          <div className="h-64 overflow-auto">
            {filteredFonts ? (
              // Search results
              <div className="p-1">
                {filteredFonts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No fonts found
                  </p>
                ) : (
                  filteredFonts.map((font) => (
                    <button
                      key={font}
                      className={cn(
                        "w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-accent",
                        value === font && "bg-accent"
                      )}
                      onClick={() => handleSelectFont(font)}
                    >
                      <span style={{ fontFamily: font }}>{font}</span>
                      {value === font && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))
                )}
              </div>
            ) : (
              // Categories
              <div className="p-1">
                {Object.entries(fontCategories).map(([key, category]) => (
                  <div key={key} className="mb-2">
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                      {category.name}
                    </p>
                    {category.fonts.map((font) => (
                      <button
                        key={font}
                        className={cn(
                          "w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-accent",
                          value === font && "bg-accent"
                        )}
                        onClick={() => handleSelectFont(font)}
                      >
                        <span style={{ fontFamily: font }}>{font}</span>
                        {value === font && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Quick font selector (horizontal scroll)
interface QuickFontSelectProps {
  value: string;
  onChange: (font: string) => void;
  fonts?: string[];
  label?: string;
  className?: string;
}

export function QuickFontSelect({
  value,
  onChange,
  fonts = fontCategories["sans-serif"].fonts.slice(0, 6),
  label,
  className,
}: QuickFontSelectProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label className="text-xs">{label}</Label>}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {fonts.map((font) => (
          <Button
            key={font}
            variant={value === font ? "primary" : "outline"}
            size="sm"
            className="shrink-0 text-xs h-7"
            style={{ fontFamily: font }}
            onClick={() => onChange(font)}
          >
            {font.split(" ")[0]}
          </Button>
        ))}
      </div>
    </div>
  );
}

// Font size selector
interface FontSizeSelectProps {
  value: number;
  onChange: (size: number) => void;
  label?: string;
  min?: number;
  max?: number;
  presets?: number[];
  className?: string;
}

export function FontSizeSelect({
  value,
  onChange,
  label,
  min = 8,
  max = 144,
  presets = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64, 72, 96],
  className,
}: FontSizeSelectProps) {
  const [inputValue, setInputValue] = useState(String(value));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const num = parseInt(inputValue, 10);
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num);
    } else {
      setInputValue(String(value));
    }
  };

  const handlePresetClick = (size: number) => {
    setInputValue(String(size));
    onChange(size);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label className="text-xs">{label}</Label>}
      <div className="flex gap-2">
        <Input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          min={min}
          max={max}
          className="w-16 h-8 text-center"
        />
        <div className="flex gap-1 overflow-x-auto flex-1">
          {presets.slice(0, 6).map((size) => (
            <Button
              key={size}
              variant={value === size ? "primary" : "outline"}
              size="sm"
              className="shrink-0 h-8 w-8 p-0 text-xs"
              onClick={() => handlePresetClick(size)}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
