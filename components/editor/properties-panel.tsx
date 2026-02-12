"use client";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ColorPicker } from "./color-picker";
import { FontPicker, FontSizeSelect } from "./font-picker";
import type { DesignElement, ElementStyle } from "@/types";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  RotateCcw,
} from "lucide-react";

interface PropertiesPanelProps {
  element: DesignElement;
  onUpdate: (updates: Partial<DesignElement>) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  className?: string;
}

export function PropertiesPanel({
  element,
  onUpdate,
  onDelete,
  onDuplicate,
  className,
}: PropertiesPanelProps) {
  const updateStyle = (styleUpdates: Partial<ElementStyle>) => {
    onUpdate({
      style: { ...element.style, ...styleUpdates },
    });
  };

  return (
    <div className={cn("space-y-4 p-4", className)}>
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm capitalize">{element.type} Properties</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onUpdate({ locked: !element.locked })}
            title={element.locked ? "Unlock" : "Lock"}
            aria-label={element.locked ? "Unlock element" : "Lock element"}
          >
            {element.locked ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              <Unlock className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onUpdate({ hidden: !element.hidden })}
            title={element.hidden ? "Show" : "Hide"}
            aria-label={element.hidden ? "Show element" : "Hide element"}
          >
            {element.hidden ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </Button>
          {onDuplicate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onDuplicate}
              title="Duplicate"
              aria-label="Duplicate element"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={onDelete}
              title="Delete"
              aria-label="Delete element"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Position & Size */}
      <div>
        <Label className="text-xs font-medium">Position & Size</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <Label className="text-xs text-muted-foreground">X</Label>
            <Input
              type="number"
              value={element.position.x}
              onChange={(e) =>
                onUpdate({
                  position: {
                    ...element.position,
                    x: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Y</Label>
            <Input
              type="number"
              value={element.position.y}
              onChange={(e) =>
                onUpdate({
                  position: {
                    ...element.position,
                    y: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Width</Label>
            <Input
              type="number"
              value={element.size.width}
              onChange={(e) =>
                onUpdate({
                  size: {
                    ...element.size,
                    width: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Height</Label>
            <Input
              type="number"
              value={element.size.height}
              onChange={(e) =>
                onUpdate({
                  size: {
                    ...element.size,
                    height: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="h-8"
            />
          </div>
        </div>
      </div>

      {/* Rotation & Opacity */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">Rotation</Label>
          <div className="flex items-center gap-2 mt-1.5">
            <Input
              type="number"
              value={element.rotation || 0}
              onChange={(e) =>
                onUpdate({ rotation: parseInt(e.target.value) || 0 })
              }
              className="h-8 w-16"
            />
            <span className="text-xs text-muted-foreground">deg</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onUpdate({ rotation: 0 })}
              title="Reset rotation"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div>
          <Label className="text-xs">Opacity</Label>
          <div className="flex items-center gap-2 mt-1.5">
            <Slider
              value={[(element.opacity ?? 1) * 100]}
              onValueChange={([val]: number[]) => onUpdate({ opacity: val / 100 })}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8">
              {Math.round((element.opacity ?? 1) * 100)}%
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Type-specific properties */}
      {element.type === "text" && (
        <TextProperties element={element} updateStyle={updateStyle} />
      )}

      {element.type === "image" && (
        <ImageProperties element={element} updateStyle={updateStyle} />
      )}

      {(element.type === "shape" || element.type === "divider") && (
        <ShapeProperties element={element} updateStyle={updateStyle} />
      )}

      {/* Border */}
      <div>
        <Label className="text-xs font-medium">Border</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="col-span-2">
            <ColorPicker
              value={element.style.borderColor || "#000000"}
              onChange={(color) => updateStyle({ borderColor: color })}
              label="Color"
            />
          </div>
          <div>
            <Label className="text-xs">Width</Label>
            <Input
              type="number"
              value={element.style.borderWidth || 0}
              onChange={(e) =>
                updateStyle({ borderWidth: parseInt(e.target.value) || 0 })
              }
              className="h-8 mt-1.5"
              min={0}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <Label className="text-xs">Style</Label>
            <Select
              value={element.style.borderStyle || "solid"}
              onValueChange={(value) =>
                updateStyle({
                  borderStyle: value as "solid" | "dashed" | "dotted",
                })
              }
            >
              <SelectTrigger className="h-8 mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Radius</Label>
            <Input
              type="number"
              value={element.style.borderRadius || 0}
              onChange={(e) =>
                updateStyle({ borderRadius: parseInt(e.target.value) || 0 })
              }
              className="h-8 mt-1.5"
              min={0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Text-specific properties
function TextProperties({
  element,
  updateStyle,
}: {
  element: DesignElement;
  updateStyle: (updates: Partial<ElementStyle>) => void;
}) {
  const style = element.style;

  return (
    <div className="space-y-3">
      <FontPicker
        value={style.fontFamily || "Inter"}
        onChange={(font) => updateStyle({ fontFamily: font })}
        label="Font Family"
      />

      <FontSizeSelect
        value={style.fontSize || 16}
        onChange={(size) => updateStyle({ fontSize: size })}
        label="Font Size"
      />

      <ColorPicker
        value={style.color || "#000000"}
        onChange={(color) => updateStyle({ color })}
        label="Text Color"
      />

      {/* Text alignment */}
      <div>
        <Label className="text-xs">Alignment</Label>
        <div className="flex gap-1 mt-1.5">
          {[
            { value: "left", icon: AlignLeft },
            { value: "center", icon: AlignCenter },
            { value: "right", icon: AlignRight },
            { value: "justify", icon: AlignJustify },
          ].map(({ value, icon: Icon }) => (
            <Button
              key={value}
              variant={style.textAlign === value ? "primary" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                updateStyle({
                  textAlign: value as "left" | "center" | "right" | "justify",
                })
              }
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>

      {/* Text style buttons */}
      <div>
        <Label className="text-xs">Style</Label>
        <div className="flex gap-1 mt-1.5">
          <Button
            variant={style.fontWeight === "bold" || style.fontWeight === 700 ? "primary" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              updateStyle({
                fontWeight: style.fontWeight === "bold" || style.fontWeight === 700 ? "normal" : "bold",
              })
            }
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={style.fontStyle === "italic" ? "primary" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              updateStyle({
                fontStyle: style.fontStyle === "italic" ? "normal" : "italic",
              })
            }
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={style.textDecoration === "underline" ? "primary" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              updateStyle({
                textDecoration:
                  style.textDecoration === "underline" ? "none" : "underline",
              })
            }
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            variant={style.textDecoration === "line-through" ? "primary" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              updateStyle({
                textDecoration:
                  style.textDecoration === "line-through"
                    ? "none"
                    : "line-through",
              })
            }
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Line height & Letter spacing */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Line Height</Label>
          <Input
            type="number"
            value={style.lineHeight || 1.5}
            onChange={(e) =>
              updateStyle({ lineHeight: parseFloat(e.target.value) || 1.5 })
            }
            className="h-8 mt-1.5"
            step={0.1}
            min={0.5}
            max={3}
          />
        </div>
        <div>
          <Label className="text-xs">Letter Spacing</Label>
          <Input
            type="number"
            value={style.letterSpacing || 0}
            onChange={(e) =>
              updateStyle({ letterSpacing: parseInt(e.target.value) || 0 })
            }
            className="h-8 mt-1.5"
            min={-5}
            max={20}
          />
        </div>
      </div>
    </div>
  );
}

// Image-specific properties
function ImageProperties({
  element,
  updateStyle,
}: {
  element: DesignElement;
  updateStyle: (updates: Partial<ElementStyle>) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Object Fit</Label>
        <Select
          value={element.style.objectFit || "cover"}
          onValueChange={(value) =>
            updateStyle({
              objectFit: value as "contain" | "cover" | "fill" | "none" | "scale-down",
            })
          }
        >
          <SelectTrigger className="h-8 mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cover">Cover</SelectItem>
            <SelectItem value="contain">Contain</SelectItem>
            <SelectItem value="fill">Fill</SelectItem>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="scale-down">Scale Down</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Shape-specific properties
function ShapeProperties({
  element,
  updateStyle,
}: {
  element: DesignElement;
  updateStyle: (updates: Partial<ElementStyle>) => void;
}) {
  return (
    <div className="space-y-3">
      <ColorPicker
        value={element.style.backgroundColor || "#000000"}
        onChange={(color) => updateStyle({ backgroundColor: color })}
        label="Fill Color"
      />
    </div>
  );
}
