"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Magnet,
  Save,
  Eye,
  Download,
  Type,
  Image,
  Square,
  Minus,
  Keyboard,
  Copy,
  Trash2,
  Lock,
  Unlock,
  ChevronsUp,
  ChevronsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/stores";
import { useEditorShortcuts, ShortcutsReference } from "@/hooks";
import * as Popover from "@radix-ui/react-popover";
import * as Tooltip from "@radix-ui/react-tooltip";

interface EditorToolbarProps {
  onSave?: () => void;
  onPreview?: () => void;
  onExport?: () => void;
  className?: string;
}

export function EditorToolbar({
  onSave,
  onPreview,
  onExport,
  className = "",
}: EditorToolbarProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);

  const {
    undo,
    redo,
    canUndo,
    canRedo,
    zoom,
    setZoom,
    resetView,
    showGrid,
    toggleGrid,
    snapToGrid,
    toggleSnapToGrid,
    getSelectedElement,
    deleteElement,
    duplicateElement,
    lockElement,
    unlockElement,
    moveElementToTop,
    moveElementToBottom,
  } = useEditorStore();

  // Enable keyboard shortcuts
  useEditorShortcuts({ enabled: true, onSave, onPreview });

  const selectedElement = getSelectedElement();

  const zoomOptions = [50, 75, 100, 125, 150, 200];

  return (
    <Tooltip.Provider delayDuration={300}>
      <div
        className={`flex items-center justify-between border-b border-surface-200 bg-white px-4 py-2 ${className}`}
      >
        {/* Left: History & Zoom */}
        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <TooltipButton
              icon={Undo2}
              tooltip="Undo (Ctrl+Z)"
              onClick={undo}
              disabled={!canUndo()}
            />
            <TooltipButton
              icon={Redo2}
              tooltip="Redo (Ctrl+Y)"
              onClick={redo}
              disabled={!canRedo()}
            />
          </div>

          <div className="mx-2 h-6 w-px bg-surface-200" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <TooltipButton
              icon={ZoomOut}
              tooltip="Zoom Out (Ctrl+-)"
              onClick={() => setZoom(zoom - 0.1)}
              disabled={zoom <= 0.1}
            />

            <Popover.Root>
              <Popover.Trigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-16 text-xs font-medium"
                >
                  {Math.round(zoom * 100)}%
                </Button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="z-50 rounded-md border border-surface-200 bg-white p-1 shadow-lg"
                  sideOffset={4}
                >
                  <div className="flex flex-col">
                    {zoomOptions.map((zoomLevel) => (
                      <button
                        key={zoomLevel}
                        onClick={() => setZoom(zoomLevel / 100)}
                        className={`rounded px-3 py-1.5 text-left text-sm hover:bg-surface-100 ${
                          Math.round(zoom * 100) === zoomLevel
                            ? "bg-brand-50 text-brand-600"
                            : "text-surface-600"
                        }`}
                      >
                        {zoomLevel}%
                      </button>
                    ))}
                    <div className="my-1 h-px bg-surface-200" />
                    <button
                      onClick={resetView}
                      className="rounded px-3 py-1.5 text-left text-sm text-surface-600 hover:bg-surface-100"
                    >
                      Reset View
                    </button>
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            <TooltipButton
              icon={ZoomIn}
              tooltip="Zoom In (Ctrl++)"
              onClick={() => setZoom(zoom + 0.1)}
              disabled={zoom >= 3}
            />
          </div>

          <div className="mx-2 h-6 w-px bg-surface-200" />

          {/* Grid & Snap */}
          <div className="flex items-center gap-1">
            <TooltipButton
              icon={Grid3X3}
              tooltip="Toggle Grid (Ctrl+')"
              onClick={toggleGrid}
              active={showGrid}
            />
            <TooltipButton
              icon={Magnet}
              tooltip="Snap to Grid"
              onClick={toggleSnapToGrid}
              active={snapToGrid}
            />
          </div>
        </div>

        {/* Center: Selected Element Actions */}
        {selectedElement && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1"
          >
            <TooltipButton
              icon={ChevronsUp}
              tooltip="Bring to Front"
              onClick={() => moveElementToTop(selectedElement.id)}
            />
            <TooltipButton
              icon={ChevronsDown}
              tooltip="Send to Back"
              onClick={() => moveElementToBottom(selectedElement.id)}
            />

            <div className="mx-2 h-6 w-px bg-surface-200" />

            <TooltipButton
              icon={Copy}
              tooltip="Duplicate (Ctrl+D)"
              onClick={() => duplicateElement(selectedElement.id)}
            />
            <TooltipButton
              icon={selectedElement.locked ? Unlock : Lock}
              tooltip={selectedElement.locked ? "Unlock" : "Lock"}
              onClick={() =>
                selectedElement.locked
                  ? unlockElement(selectedElement.id)
                  : lockElement(selectedElement.id)
              }
              active={selectedElement.locked}
            />
            <TooltipButton
              icon={Trash2}
              tooltip="Delete (Del)"
              onClick={() => deleteElement(selectedElement.id)}
              variant="destructive"
            />
          </motion.div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Shortcuts Help */}
          <Popover.Root open={showShortcuts} onOpenChange={setShowShortcuts}>
            <Popover.Trigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Keyboard shortcuts">
                <Keyboard className="h-4 w-4" />
              </Button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="z-50 w-80 rounded-lg border border-surface-200 bg-white p-4 shadow-lg"
                sideOffset={8}
                align="end"
              >
                <ShortcutsReference />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          <div className="mx-2 h-6 w-px bg-surface-200" />

          {/* Save */}
          <Button variant="outline" size="sm" onClick={onSave}>
            <Save className="mr-1.5 h-4 w-4" />
            Save
          </Button>

          {/* Preview */}
          <Button variant="outline" size="sm" onClick={onPreview}>
            <Eye className="mr-1.5 h-4 w-4" />
            Preview
          </Button>

          {/* Export */}
          <Button variant="primary" size="sm" onClick={onExport}>
            <Download className="mr-1.5 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
    </Tooltip.Provider>
  );
}

// Tooltip button component
interface TooltipButtonProps {
  icon: React.ElementType;
  tooltip: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  variant?: "default" | "destructive";
}

function TooltipButton({
  icon: Icon,
  tooltip,
  onClick,
  disabled = false,
  active = false,
  variant = "default",
}: TooltipButtonProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          disabled={disabled}
          aria-label={tooltip}
          className={`h-8 w-8 ${
            active ? "bg-brand-100 text-brand-600" : ""
          } ${variant === "destructive" ? "hover:bg-red-50 hover:text-red-600" : ""}`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="z-50 rounded-md bg-surface-900 px-2 py-1 text-xs text-white"
          sideOffset={4}
        >
          {tooltip}
          <Tooltip.Arrow className="fill-surface-900" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

// Add Element Toolbar (for sidebar)
export function AddElementToolbar({
  onAddText,
  onAddImage,
  onAddShape,
  onAddDivider,
  className = "",
}: {
  onAddText: () => void;
  onAddImage: () => void;
  onAddShape: () => void;
  onAddDivider: () => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="mb-1 text-xs font-medium text-surface-500">Add Element</span>
      <div className="grid grid-cols-4 gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddText}
          className="flex h-12 flex-col items-center justify-center gap-1"
        >
          <Type className="h-4 w-4" />
          <span className="text-[10px]">Text</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddImage}
          className="flex h-12 flex-col items-center justify-center gap-1"
        >
          <Image className="h-4 w-4" />
          <span className="text-[10px]">Image</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddShape}
          className="flex h-12 flex-col items-center justify-center gap-1"
        >
          <Square className="h-4 w-4" />
          <span className="text-[10px]">Shape</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddDivider}
          className="flex h-12 flex-col items-center justify-center gap-1"
        >
          <Minus className="h-4 w-4" />
          <span className="text-[10px]">Divider</span>
        </Button>
      </div>
    </div>
  );
}
