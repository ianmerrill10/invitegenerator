"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Eye,
  Undo,
  Redo,
  Type,
  Image,
  Square,
  Circle,
  Minus,
  Palette,
  Settings,
  Layers,
  ZoomIn,
  ZoomOut,
  Grid,
  Move,
  Trash2,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useInvitationStore } from "@/lib/stores";
import type { DesignElement, ElementType, InvitationDesign } from "@/types";

// Element tools
const elementTools: { type: ElementType; icon: React.ReactNode; label: string }[] = [
  { type: "text", icon: <Type className="h-5 w-5" />, label: "Text" },
  { type: "image", icon: <Image className="h-5 w-5" />, label: "Image" },
  { type: "shape", icon: <Square className="h-5 w-5" />, label: "Rectangle" },
  { type: "divider", icon: <Minus className="h-5 w-5" />, label: "Divider" },
];

// Preset colors
const presetColors = [
  "#FF6B47", "#14B8A6", "#FCD34D", "#8B5CF6", "#EC4899",
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6366F1",
  "#000000", "#FFFFFF", "#F5F5F5", "#1C1917", "#78716C",
];

// Font options
const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Outfit", label: "Outfit" },
  { value: "Georgia", label: "Georgia" },
  { value: "Arial", label: "Arial" },
];

export default function InvitationEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { currentInvitation, fetchInvitation, updateInvitation, isLoading } = useInvitationStore();

  const [elements, setElements] = React.useState<DesignElement[]>([]);
  const [selectedElement, setSelectedElement] = React.useState<string | null>(null);
  const [designSettings, setDesignSettings] = React.useState<Partial<InvitationDesign>>({});
  const [zoom, setZoom] = React.useState(1);
  const [showGrid, setShowGrid] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"elements" | "design" | "settings">("elements");
  const [saving, setSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  const canvasRef = React.useRef<HTMLDivElement>(null);

  // Load invitation data
  React.useEffect(() => {
    if (id) {
      fetchInvitation(id);
    }
  }, [id, fetchInvitation]);

  // Initialize state from invitation
  React.useEffect(() => {
    if (currentInvitation) {
      setElements(currentInvitation.designData?.elements || []);
      setDesignSettings({
        backgroundColor: currentInvitation.designData?.backgroundColor || "#FFFFFF",
        primaryColor: currentInvitation.designData?.primaryColor || "#FF6B47",
        secondaryColor: currentInvitation.designData?.secondaryColor || "#14B8A6",
        fontFamily: currentInvitation.designData?.fontFamily || "Inter",
        headingFont: currentInvitation.designData?.headingFont || "Playfair Display",
        width: currentInvitation.designData?.width || 800,
        height: currentInvitation.designData?.height || 1120,
      });
    }
  }, [currentInvitation]);

  // Generate unique ID
  const generateId = () => `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add new element
  const addElement = (type: ElementType) => {
    const newElement: DesignElement = {
      id: generateId(),
      type,
      content: type === "text" ? "New Text" : "",
      position: { x: 100, y: 100 },
      size: {
        width: type === "text" ? 200 : type === "divider" ? 300 : 150,
        height: type === "text" ? 50 : type === "divider" ? 4 : 150,
      },
      style: {
        fontFamily: designSettings.fontFamily || "Inter",
        fontSize: type === "text" ? 24 : undefined,
        color: type === "text" ? "#1C1917" : designSettings.primaryColor,
        backgroundColor: type === "shape" ? designSettings.primaryColor : undefined,
      },
      zIndex: elements.length,
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setHasChanges(true);
  };

  // Update element
  const updateElement = (id: string, updates: Partial<DesignElement>) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, ...updates } : el)));
    setHasChanges(true);
  };

  // Delete element
  const deleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
    setHasChanges(true);
  };

  // Update design setting
  const updateDesignSetting = (key: keyof InvitationDesign, value: unknown) => {
    setDesignSettings({ ...designSettings, [key]: value });
    setHasChanges(true);
  };

  // Save changes
  const handleSave = async () => {
    if (!currentInvitation) return;

    setSaving(true);
    try {
      await updateInvitation(id, {
        designData: {
          ...currentInvitation.designData,
          ...designSettings,
          elements,
        },
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Get selected element
  const selectedEl = elements.find((el) => el.id === selectedElement);

  if (isLoading || !currentInvitation) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-surface-100">
      {/* Top Bar */}
      <div className="h-14 bg-white border-b border-surface-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/invitations/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold text-surface-900">{currentInvitation.title}</h1>
            <p className="text-xs text-surface-500">Invitation Editor</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-sm text-warning-600 mr-2">Unsaved changes</span>
          )}
          <Button variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
            Preview
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={saving || !hasChanges}
            leftIcon={<Save className="h-4 w-4" />}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
          <Link href={`/dashboard/invitations/${id}/order`}>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Printer className="h-4 w-4" />}
              className="bg-brand-500 hover:bg-brand-600 text-white"
            >
              Order Prints
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-64 bg-white border-r border-surface-200 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-surface-200">
            {[
              { id: "elements", label: "Elements", icon: <Layers className="h-4 w-4" /> },
              { id: "design", label: "Design", icon: <Palette className="h-4 w-4" /> },
              { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5",
                  activeTab === tab.id
                    ? "text-brand-600 border-b-2 border-brand-600"
                    : "text-surface-500 hover:text-surface-700"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "elements" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-surface-700 mb-3">Add Elements</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {elementTools.map((tool) => (
                      <button
                        key={tool.type}
                        onClick={() => addElement(tool.type)}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg border border-surface-200 hover:border-brand-500 hover:bg-brand-50 transition-colors"
                      >
                        {tool.icon}
                        <span className="text-xs text-surface-600">{tool.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-surface-700 mb-3">
                    Layers ({elements.length})
                  </h3>
                  <div className="space-y-1">
                    {[...elements].reverse().map((el) => (
                      <button
                        key={el.id}
                        onClick={() => setSelectedElement(el.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                          selectedElement === el.id
                            ? "bg-brand-50 text-brand-700"
                            : "hover:bg-surface-100 text-surface-600"
                        )}
                      >
                        {el.type === "text" && <Type className="h-4 w-4" />}
                        {el.type === "image" && <Image className="h-4 w-4" />}
                        {el.type === "shape" && <Square className="h-4 w-4" />}
                        {el.type === "divider" && <Minus className="h-4 w-4" />}
                        <span className="truncate">
                          {el.type === "text" ? el.content.slice(0, 20) : el.type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "design" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-surface-700 mb-3">Background</h3>
                  <div className="flex flex-wrap gap-2">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => updateDesignSetting("backgroundColor", color)}
                        className={cn(
                          "w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110",
                          designSettings.backgroundColor === color
                            ? "border-brand-500 ring-2 ring-brand-200"
                            : "border-surface-200"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-surface-700 mb-3">Primary Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {presetColors.slice(0, 10).map((color) => (
                      <button
                        key={color}
                        onClick={() => updateDesignSetting("primaryColor", color)}
                        className={cn(
                          "w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110",
                          designSettings.primaryColor === color
                            ? "border-brand-500 ring-2 ring-brand-200"
                            : "border-surface-200"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-surface-700 mb-3">Fonts</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-surface-500 mb-1 block">Body Font</label>
                      <select
                        value={designSettings.fontFamily}
                        onChange={(e) => updateDesignSetting("fontFamily", e.target.value)}
                        className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm"
                      >
                        {fontOptions.map((font) => (
                          <option key={font.value} value={font.value}>
                            {font.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-surface-500 mb-1 block">Heading Font</label>
                      <select
                        value={designSettings.headingFont}
                        onChange={(e) => updateDesignSetting("headingFont", e.target.value)}
                        className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm"
                      >
                        {fontOptions.map((font) => (
                          <option key={font.value} value={font.value}>
                            {font.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-surface-700 mb-3">Canvas Size</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-surface-500 mb-1 block">Width (px)</label>
                      <Input
                        type="number"
                        value={designSettings.width}
                        onChange={(e) => updateDesignSetting("width", parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-surface-500 mb-1 block">Height (px)</label>
                      <Input
                        type="number"
                        value={designSettings.height}
                        onChange={(e) => updateDesignSetting("height", parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-surface-700 mb-3">Presets</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Standard (5x7)", width: 700, height: 980 },
                      { label: "Square", width: 800, height: 800 },
                      { label: "Wide", width: 1000, height: 700 },
                      { label: "Story (9:16)", width: 540, height: 960 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          updateDesignSetting("width", preset.width);
                          updateDesignSetting("height", preset.height);
                        }}
                        className="w-full px-3 py-2 text-sm text-left rounded-lg border border-surface-200 hover:border-brand-500 hover:bg-brand-50 transition-colors"
                      >
                        {preset.label}
                        <span className="text-xs text-surface-400 ml-2">
                          {preset.width}x{preset.height}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas Toolbar */}
          <div className="h-10 bg-white border-b border-surface-200 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon-sm" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-surface-600 w-16 text-center">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="icon-sm" onClick={() => setZoom(Math.min(2, zoom + 0.25))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showGrid ? "secondary" : "ghost"}
                size="icon-sm"
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-surface-200">
            <div
              ref={canvasRef}
              className="relative shadow-2xl"
              style={{
                width: (designSettings.width || 800) * zoom,
                height: (designSettings.height || 1120) * zoom,
                backgroundColor: designSettings.backgroundColor || "#FFFFFF",
                backgroundImage: showGrid
                  ? "linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)"
                  : undefined,
                backgroundSize: showGrid ? `${20 * zoom}px ${20 * zoom}px` : undefined,
              }}
              onClick={() => setSelectedElement(null)}
            >
              {elements.map((element) => (
                <div
                  key={element.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement(element.id);
                  }}
                  className={cn(
                    "absolute cursor-move transition-shadow",
                    selectedElement === element.id && "ring-2 ring-brand-500 ring-offset-2"
                  )}
                  style={{
                    left: element.position.x * zoom,
                    top: element.position.y * zoom,
                    width: element.size.width * zoom,
                    height: element.size.height * zoom,
                    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
                    opacity: element.opacity ?? 1,
                    zIndex: element.zIndex,
                  }}
                >
                  {element.type === "text" && (
                    <div
                      style={{
                        fontFamily: element.style.fontFamily,
                        fontSize: (element.style.fontSize || 16) * zoom,
                        fontWeight: element.style.fontWeight,
                        color: element.style.color,
                        textAlign: element.style.textAlign,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {element.content}
                    </div>
                  )}
                  {element.type === "shape" && (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: element.style.backgroundColor,
                        borderRadius: element.style.borderRadius,
                        border: element.style.borderWidth
                          ? `${element.style.borderWidth}px solid ${element.style.borderColor}`
                          : undefined,
                      }}
                    />
                  )}
                  {element.type === "divider" && (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: element.style.backgroundColor || designSettings.primaryColor,
                        borderRadius: "999px",
                      }}
                    />
                  )}
                  {element.type === "image" && (
                    <div className="w-full h-full bg-surface-100 flex items-center justify-center text-surface-400 rounded">
                      <Image className="h-8 w-8" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        {selectedEl && (
          <div className="w-64 bg-white border-l border-surface-200 overflow-y-auto">
            <div className="p-4 border-b border-surface-200 flex items-center justify-between">
              <h3 className="font-medium text-surface-900">Properties</h3>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-error-600"
                onClick={() => deleteElement(selectedEl.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 space-y-6">
              {/* Position */}
              <div>
                <h4 className="text-sm font-medium text-surface-700 mb-3">Position</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-surface-500 mb-1 block">X</label>
                    <Input
                      type="number"
                      value={selectedEl.position.x}
                      onChange={(e) =>
                        updateElement(selectedEl.id, {
                          position: { ...selectedEl.position, x: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-surface-500 mb-1 block">Y</label>
                    <Input
                      type="number"
                      value={selectedEl.position.y}
                      onChange={(e) =>
                        updateElement(selectedEl.id, {
                          position: { ...selectedEl.position, y: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Size */}
              <div>
                <h4 className="text-sm font-medium text-surface-700 mb-3">Size</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-surface-500 mb-1 block">Width</label>
                    <Input
                      type="number"
                      value={selectedEl.size.width}
                      onChange={(e) =>
                        updateElement(selectedEl.id, {
                          size: { ...selectedEl.size, width: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-surface-500 mb-1 block">Height</label>
                    <Input
                      type="number"
                      value={selectedEl.size.height}
                      onChange={(e) =>
                        updateElement(selectedEl.id, {
                          size: { ...selectedEl.size, height: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Text-specific properties */}
              {selectedEl.type === "text" && (
                <>
                  <div>
                    <h4 className="text-sm font-medium text-surface-700 mb-3">Content</h4>
                    <textarea
                      value={selectedEl.content}
                      onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })}
                      className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-surface-700 mb-3">Typography</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-surface-500 mb-1 block">Font Size</label>
                        <Input
                          type="number"
                          value={selectedEl.style.fontSize || 16}
                          onChange={(e) =>
                            updateElement(selectedEl.id, {
                              style: { ...selectedEl.style, fontSize: parseInt(e.target.value) || 16 },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-surface-500 mb-1 block">Color</label>
                        <div className="flex flex-wrap gap-2">
                          {presetColors.map((color) => (
                            <button
                              key={color}
                              onClick={() =>
                                updateElement(selectedEl.id, {
                                  style: { ...selectedEl.style, color },
                                })
                              }
                              className={cn(
                                "w-6 h-6 rounded border-2",
                                selectedEl.style.color === color
                                  ? "border-brand-500"
                                  : "border-surface-200"
                              )}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Shape-specific properties */}
              {selectedEl.type === "shape" && (
                <div>
                  <h4 className="text-sm font-medium text-surface-700 mb-3">Fill Color</h4>
                  <div className="flex flex-wrap gap-2">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          updateElement(selectedEl.id, {
                            style: { ...selectedEl.style, backgroundColor: color },
                          })
                        }
                        className={cn(
                          "w-6 h-6 rounded border-2",
                          selectedEl.style.backgroundColor === color
                            ? "border-brand-500"
                            : "border-surface-200"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
