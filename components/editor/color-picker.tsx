"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pipette, Check } from "lucide-react";

// Preset color palettes
const colorPalettes = {
  basic: [
    "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff",
    "#ffff00", "#ff00ff", "#00ffff", "#ff8000", "#8000ff",
  ],
  grays: [
    "#000000", "#1a1a1a", "#333333", "#4d4d4d", "#666666",
    "#808080", "#999999", "#b3b3b3", "#cccccc", "#ffffff",
  ],
  pastels: [
    "#ffb3ba", "#ffdfba", "#ffffba", "#baffc9", "#bae1ff",
    "#e0bbff", "#ffc4e1", "#c4f5ff", "#fff5c4", "#d4ffb3",
  ],
  vibrant: [
    "#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93",
    "#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#54a0ff",
  ],
  earth: [
    "#5c4033", "#8b4513", "#a0522d", "#cd853f", "#deb887",
    "#d2b48c", "#f5deb3", "#faf0e6", "#556b2f", "#6b8e23",
  ],
};

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  showOpacity?: boolean;
  className?: string;
}

export function ColorPicker({
  value,
  onChange,
  label,
  showOpacity = false,
  className,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleColorSelect = useCallback(
    (color: string) => {
      setInputValue(color);
      onChange(color);
    },
    [onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleInputBlur = () => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(inputValue)) {
      setInputValue(value);
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label className="text-xs">{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-9"
          >
            <div
              className="w-5 h-5 rounded border"
              style={{ backgroundColor: value }}
            />
            <span className="text-xs font-mono uppercase">{value}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <Tabs defaultValue="palette">
            <TabsList className="w-full mb-3">
              <TabsTrigger value="palette" className="flex-1 text-xs">
                Palette
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex-1 text-xs">
                Custom
              </TabsTrigger>
            </TabsList>

            <TabsContent value="palette" className="space-y-3">
              {Object.entries(colorPalettes).map(([name, colors]) => (
                <div key={name}>
                  <p className="text-xs text-muted-foreground capitalize mb-1.5">
                    {name}
                  </p>
                  <div className="grid grid-cols-5 gap-1">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className={cn(
                          "w-8 h-8 rounded border transition-transform hover:scale-110",
                          value === color && "ring-2 ring-primary ring-offset-1"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorSelect(color)}
                        aria-label={`Select color ${color}${value === color ? " (selected)" : ""}`}
                      >
                        {value === color && (
                          <Check
                            className={cn(
                              "w-4 h-4 mx-auto",
                              isLightColor(color)
                                ? "text-black"
                                : "text-white"
                            )}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="custom" className="space-y-3">
              <div>
                <Label className="text-xs">Color</Label>
                <div className="flex gap-2 mt-1.5">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="w-12 h-9 rounded border cursor-pointer"
                  />
                  <Input
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="#000000"
                    className="flex-1 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              {/* Recent colors could go here */}
              <div>
                <Label className="text-xs">Preview</Label>
                <div
                  className="h-12 rounded border mt-1.5"
                  style={{ backgroundColor: value }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Inline color swatch button
interface ColorSwatchProps {
  color: string;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export function ColorSwatch({
  color,
  selected = false,
  onClick,
  size = "md",
}: ColorSwatchProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  return (
    <button
      className={cn(
        "rounded border transition-transform hover:scale-110",
        sizeClasses[size],
        selected && "ring-2 ring-primary ring-offset-1"
      )}
      style={{ backgroundColor: color }}
      onClick={onClick}
      aria-label={`Color ${color}${selected ? " (selected)" : ""}`}
    >
      {selected && (
        <Check
          className={cn(
            "mx-auto",
            size === "sm" ? "w-3 h-3" : "w-4 h-4",
            isLightColor(color) ? "text-black" : "text-white"
          )}
        />
      )}
    </button>
  );
}

// Quick color selector (row of swatches)
interface QuickColorSelectProps {
  value: string;
  onChange: (color: string) => void;
  colors?: string[];
  label?: string;
  className?: string;
}

export function QuickColorSelect({
  value,
  onChange,
  colors = colorPalettes.basic,
  label,
  className,
}: QuickColorSelectProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label className="text-xs">{label}</Label>}
      <div className="flex flex-wrap gap-1">
        {colors.map((color) => (
          <ColorSwatch
            key={color}
            color={color}
            selected={value === color}
            onClick={() => onChange(color)}
            size="sm"
          />
        ))}
      </div>
    </div>
  );
}

// Helper to determine if a color is light
function isLightColor(color: string): boolean {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}

export { colorPalettes };
