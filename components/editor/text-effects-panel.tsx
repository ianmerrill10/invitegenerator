"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Type,
  Sun,
  Circle,
  Palette,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as Slider from "@radix-ui/react-slider";
import * as Switch from "@radix-ui/react-switch";
import { ChromePicker, ColorResult } from "react-color";
import type { TextShadow, TextOutline, TextGradient, GradientStop, ElementStyle } from "@/types";

interface TextEffectsPanelProps {
  style: ElementStyle;
  onChange: (updates: Partial<ElementStyle>) => void;
  className?: string;
}

export function TextEffectsPanel({ style, onChange, className = "" }: TextEffectsPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("shadow");

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className={`flex flex-col divide-y divide-surface-200 ${className}`}>
      {/* Text Shadow */}
      <TextShadowSection
        shadow={style.textShadow}
        isExpanded={expandedSection === "shadow"}
        onToggle={() => toggleSection("shadow")}
        onChange={(shadow) => onChange({ textShadow: shadow })}
      />

      {/* Text Outline */}
      <TextOutlineSection
        outline={style.textOutline}
        isExpanded={expandedSection === "outline"}
        onToggle={() => toggleSection("outline")}
        onChange={(outline) => onChange({ textOutline: outline })}
      />

      {/* Text Gradient */}
      <TextGradientSection
        gradient={style.textGradient}
        isExpanded={expandedSection === "gradient"}
        onToggle={() => toggleSection("gradient")}
        onChange={(gradient) => onChange({ textGradient: gradient })}
      />

      {/* Text Transform */}
      <TextTransformSection
        transform={style.textTransform}
        onChange={(transform) => onChange({ textTransform: transform })}
      />
    </div>
  );
}

// ==================== TEXT SHADOW SECTION ====================
interface TextShadowSectionProps {
  shadow?: TextShadow;
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (shadow: TextShadow) => void;
}

function TextShadowSection({ shadow, isExpanded, onToggle, onChange }: TextShadowSectionProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const defaultShadow: TextShadow = {
    enabled: false,
    offsetX: 2,
    offsetY: 2,
    blur: 4,
    color: "#000000",
  };

  const currentShadow = shadow || defaultShadow;

  const handleToggle = (enabled: boolean) => {
    onChange({ ...currentShadow, enabled });
  };

  return (
    <div className="py-3 px-4">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4 text-surface-500" />
          <span className="text-sm font-medium text-surface-700">Shadow</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch.Root
            checked={currentShadow.enabled}
            onCheckedChange={handleToggle}
            onClick={(e) => e.stopPropagation()}
            className="relative h-5 w-9 rounded-full bg-surface-200 data-[state=checked]:bg-brand-500"
          >
            <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-4" />
          </Switch.Root>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-surface-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-surface-400" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && currentShadow.enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 space-y-3 overflow-hidden"
          >
            {/* Offset X */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-surface-500">Offset X</span>
                <span className="text-xs text-surface-600">{currentShadow.offsetX}px</span>
              </div>
              <Slider.Root
                value={[currentShadow.offsetX]}
                onValueChange={([value]) => onChange({ ...currentShadow, offsetX: value })}
                min={-20}
                max={20}
                step={1}
                className="relative flex h-5 w-full items-center"
              >
                <Slider.Track className="relative h-1 w-full grow rounded-full bg-surface-200">
                  <Slider.Range className="absolute h-full rounded-full bg-brand-500" />
                </Slider.Track>
                <Slider.Thumb className="block h-4 w-4 rounded-full bg-white shadow-md ring-1 ring-surface-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2" />
              </Slider.Root>
            </div>

            {/* Offset Y */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-surface-500">Offset Y</span>
                <span className="text-xs text-surface-600">{currentShadow.offsetY}px</span>
              </div>
              <Slider.Root
                value={[currentShadow.offsetY]}
                onValueChange={([value]) => onChange({ ...currentShadow, offsetY: value })}
                min={-20}
                max={20}
                step={1}
                className="relative flex h-5 w-full items-center"
              >
                <Slider.Track className="relative h-1 w-full grow rounded-full bg-surface-200">
                  <Slider.Range className="absolute h-full rounded-full bg-brand-500" />
                </Slider.Track>
                <Slider.Thumb className="block h-4 w-4 rounded-full bg-white shadow-md ring-1 ring-surface-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2" />
              </Slider.Root>
            </div>

            {/* Blur */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-surface-500">Blur</span>
                <span className="text-xs text-surface-600">{currentShadow.blur}px</span>
              </div>
              <Slider.Root
                value={[currentShadow.blur]}
                onValueChange={([value]) => onChange({ ...currentShadow, blur: value })}
                min={0}
                max={30}
                step={1}
                className="relative flex h-5 w-full items-center"
              >
                <Slider.Track className="relative h-1 w-full grow rounded-full bg-surface-200">
                  <Slider.Range className="absolute h-full rounded-full bg-brand-500" />
                </Slider.Track>
                <Slider.Thumb className="block h-4 w-4 rounded-full bg-white shadow-md ring-1 ring-surface-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2" />
              </Slider.Root>
            </div>

            {/* Color */}
            <div className="space-y-1">
              <span className="text-xs text-surface-500">Color</span>
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="flex h-8 w-full items-center gap-2 rounded border border-surface-200 px-2"
                >
                  <div
                    className="h-5 w-5 rounded border border-surface-200"
                    style={{ backgroundColor: currentShadow.color }}
                  />
                  <span className="text-xs text-surface-600">{currentShadow.color}</span>
                </button>
                {showColorPicker && (
                  <div className="absolute left-0 top-full z-50 mt-1">
                    <div
                      className="fixed inset-0"
                      onClick={() => setShowColorPicker(false)}
                    />
                    <ChromePicker
                      color={currentShadow.color}
                      onChange={(color: ColorResult) =>
                        onChange({ ...currentShadow, color: color.hex })
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== TEXT OUTLINE SECTION ====================
interface TextOutlineSectionProps {
  outline?: TextOutline;
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (outline: TextOutline) => void;
}

function TextOutlineSection({ outline, isExpanded, onToggle, onChange }: TextOutlineSectionProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const defaultOutline: TextOutline = {
    enabled: false,
    width: 1,
    color: "#000000",
  };

  const currentOutline = outline || defaultOutline;

  return (
    <div className="py-3 px-4">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Circle className="h-4 w-4 text-surface-500" />
          <span className="text-sm font-medium text-surface-700">Outline</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch.Root
            checked={currentOutline.enabled}
            onCheckedChange={(enabled) => onChange({ ...currentOutline, enabled })}
            onClick={(e) => e.stopPropagation()}
            className="relative h-5 w-9 rounded-full bg-surface-200 data-[state=checked]:bg-brand-500"
          >
            <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-4" />
          </Switch.Root>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-surface-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-surface-400" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && currentOutline.enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 space-y-3 overflow-hidden"
          >
            {/* Width */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-surface-500">Width</span>
                <span className="text-xs text-surface-600">{currentOutline.width}px</span>
              </div>
              <Slider.Root
                value={[currentOutline.width]}
                onValueChange={([value]) => onChange({ ...currentOutline, width: value })}
                min={1}
                max={10}
                step={0.5}
                className="relative flex h-5 w-full items-center"
              >
                <Slider.Track className="relative h-1 w-full grow rounded-full bg-surface-200">
                  <Slider.Range className="absolute h-full rounded-full bg-brand-500" />
                </Slider.Track>
                <Slider.Thumb className="block h-4 w-4 rounded-full bg-white shadow-md ring-1 ring-surface-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2" />
              </Slider.Root>
            </div>

            {/* Color */}
            <div className="space-y-1">
              <span className="text-xs text-surface-500">Color</span>
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="flex h-8 w-full items-center gap-2 rounded border border-surface-200 px-2"
                >
                  <div
                    className="h-5 w-5 rounded border border-surface-200"
                    style={{ backgroundColor: currentOutline.color }}
                  />
                  <span className="text-xs text-surface-600">{currentOutline.color}</span>
                </button>
                {showColorPicker && (
                  <div className="absolute left-0 top-full z-50 mt-1">
                    <div
                      className="fixed inset-0"
                      onClick={() => setShowColorPicker(false)}
                    />
                    <ChromePicker
                      color={currentOutline.color}
                      onChange={(color: ColorResult) =>
                        onChange({ ...currentOutline, color: color.hex })
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== TEXT GRADIENT SECTION ====================
interface TextGradientSectionProps {
  gradient?: TextGradient;
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (gradient: TextGradient) => void;
}

function TextGradientSection({ gradient, isExpanded, onToggle, onChange }: TextGradientSectionProps) {
  const [activeColorIndex, setActiveColorIndex] = useState<number | null>(null);

  const defaultGradient: TextGradient = {
    enabled: false,
    type: "linear",
    angle: 90,
    colors: [
      { color: "#EC4899", position: 0 },
      { color: "#64748B", position: 100 },
    ],
  };

  const currentGradient = gradient || defaultGradient;

  const addColorStop = () => {
    const newPosition = 50;
    const newStop: GradientStop = { color: "#888888", position: newPosition };
    const newColors = [...currentGradient.colors, newStop].sort(
      (a, b) => a.position - b.position
    );
    onChange({ ...currentGradient, colors: newColors });
  };

  const removeColorStop = (index: number) => {
    if (currentGradient.colors.length <= 2) return;
    const newColors = currentGradient.colors.filter((_, i) => i !== index);
    onChange({ ...currentGradient, colors: newColors });
    setActiveColorIndex(null);
  };

  const updateColorStop = (index: number, updates: Partial<GradientStop>) => {
    const newColors = currentGradient.colors.map((stop, i) =>
      i === index ? { ...stop, ...updates } : stop
    );
    onChange({ ...currentGradient, colors: newColors });
  };

  const gradientPreview = `linear-gradient(${currentGradient.angle}deg, ${currentGradient.colors
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(", ")})`;

  return (
    <div className="py-3 px-4">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-surface-500" />
          <span className="text-sm font-medium text-surface-700">Gradient</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch.Root
            checked={currentGradient.enabled}
            onCheckedChange={(enabled) => onChange({ ...currentGradient, enabled })}
            onClick={(e) => e.stopPropagation()}
            className="relative h-5 w-9 rounded-full bg-surface-200 data-[state=checked]:bg-brand-500"
          >
            <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-4" />
          </Switch.Root>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-surface-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-surface-400" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && currentGradient.enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 space-y-3 overflow-hidden"
          >
            {/* Gradient Preview */}
            <div
              className="h-8 w-full rounded border border-surface-200"
              style={{ background: gradientPreview }}
            />

            {/* Type */}
            <div className="flex gap-2">
              <Button
                variant={currentGradient.type === "linear" ? "primary" : "outline"}
                size="sm"
                onClick={() => onChange({ ...currentGradient, type: "linear" })}
                className="flex-1"
              >
                Linear
              </Button>
              <Button
                variant={currentGradient.type === "radial" ? "primary" : "outline"}
                size="sm"
                onClick={() => onChange({ ...currentGradient, type: "radial" })}
                className="flex-1"
              >
                Radial
              </Button>
            </div>

            {/* Angle (for linear) */}
            {currentGradient.type === "linear" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-500">Angle</span>
                  <span className="text-xs text-surface-600">{currentGradient.angle}°</span>
                </div>
                <Slider.Root
                  value={[currentGradient.angle || 90]}
                  onValueChange={([value]) => onChange({ ...currentGradient, angle: value })}
                  min={0}
                  max={360}
                  step={1}
                  className="relative flex h-5 w-full items-center"
                >
                  <Slider.Track className="relative h-1 w-full grow rounded-full bg-surface-200">
                    <Slider.Range className="absolute h-full rounded-full bg-brand-500" />
                  </Slider.Track>
                  <Slider.Thumb className="block h-4 w-4 rounded-full bg-white shadow-md ring-1 ring-surface-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2" />
                </Slider.Root>
              </div>
            )}

            {/* Color Stops */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-surface-500">Color Stops</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addColorStop}
                  className="h-6 px-2"
                  aria-label="Add color stop"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-1">
                {currentGradient.colors.map((stop, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveColorIndex(activeColorIndex === index ? null : index)
                        }
                        className="h-6 w-6 rounded border border-surface-200"
                        style={{ backgroundColor: stop.color }}
                      />
                      {activeColorIndex === index && (
                        <div className="absolute left-0 top-full z-50 mt-1">
                          <div
                            className="fixed inset-0"
                            onClick={() => setActiveColorIndex(null)}
                          />
                          <ChromePicker
                            color={stop.color}
                            onChange={(color: ColorResult) =>
                              updateColorStop(index, { color: color.hex })
                            }
                          />
                        </div>
                      )}
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={stop.position}
                      onChange={(e) =>
                        updateColorStop(index, { position: Number(e.target.value) })
                      }
                      className="h-6 w-16 text-xs"
                    />
                    <span className="text-xs text-surface-400">%</span>
                    {currentGradient.colors.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeColorStop(index)}
                        className="h-6 w-6"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== TEXT TRANSFORM SECTION ====================
interface TextTransformSectionProps {
  transform?: "none" | "uppercase" | "lowercase" | "capitalize";
  onChange: (transform: "none" | "uppercase" | "lowercase" | "capitalize") => void;
}

function TextTransformSection({ transform, onChange }: TextTransformSectionProps) {
  const options: Array<{ value: "none" | "uppercase" | "lowercase" | "capitalize"; label: string }> = [
    { value: "none", label: "Aa" },
    { value: "uppercase", label: "AA" },
    { value: "lowercase", label: "aa" },
    { value: "capitalize", label: "Aa" },
  ];

  return (
    <div className="py-3 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-surface-500" />
          <span className="text-sm font-medium text-surface-700">Transform</span>
        </div>
        <div className="flex gap-1">
          {options.map((option) => (
            <Button
              key={option.value}
              variant={transform === option.value ? "primary" : "ghost"}
              size="sm"
              onClick={() => onChange(option.value)}
              className="h-7 w-8 text-xs"
              title={option.value}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper function to generate CSS from text effects
export function generateTextEffectStyles(style: ElementStyle): React.CSSProperties {
  const cssStyles: React.CSSProperties = {};

  // Text Shadow
  if (style.textShadow?.enabled) {
    const { offsetX, offsetY, blur, color } = style.textShadow;
    cssStyles.textShadow = `${offsetX}px ${offsetY}px ${blur}px ${color}`;
  }

  // Text Outline (using text-stroke)
  if (style.textOutline?.enabled) {
    const { width, color } = style.textOutline;
    cssStyles.WebkitTextStroke = `${width}px ${color}`;
  }

  // Text Gradient (using background-clip)
  if (style.textGradient?.enabled) {
    const { type, angle, colors } = style.textGradient;
    const gradient =
      type === "linear"
        ? `linear-gradient(${angle}deg, ${colors.map((s) => `${s.color} ${s.position}%`).join(", ")})`
        : `radial-gradient(circle, ${colors.map((s) => `${s.color} ${s.position}%`).join(", ")})`;

    cssStyles.background = gradient;
    cssStyles.WebkitBackgroundClip = "text";
    cssStyles.WebkitTextFillColor = "transparent";
    cssStyles.backgroundClip = "text";
  }

  // Text Transform
  if (style.textTransform) {
    cssStyles.textTransform = style.textTransform;
  }

  return cssStyles;
}
