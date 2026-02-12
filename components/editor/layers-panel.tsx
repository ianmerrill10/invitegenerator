"use client";

import { useMemo } from "react";
import { motion, Reorder } from "framer-motion";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Type,
  Image,
  Square,
  Minus,
  QrCode,
  Map,
  Timer,
  Sparkles,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/stores";
import type { DesignElement, ElementType } from "@/types";

interface LayersPanelProps {
  className?: string;
}

// Icon mapping for element types
const ELEMENT_ICONS: Record<ElementType, React.ElementType> = {
  text: Type,
  image: Image,
  shape: Square,
  icon: Sparkles,
  divider: Minus,
  qrcode: QrCode,
  map: Map,
  countdown: Timer,
};

export function LayersPanel({ className = "" }: LayersPanelProps) {
  const {
    elements,
    selectedElementId,
    selectElement,
    deleteElement,
    duplicateElement,
    moveElementUp,
    moveElementDown,
    moveElementToTop,
    moveElementToBottom,
    lockElement,
    unlockElement,
    hideElement,
    showElement,
    setElements,
  } = useEditorStore();

  // Sort elements by zIndex (highest first for visual representation)
  const sortedElements = useMemo(() => {
    return [...elements].sort((a, b) => b.zIndex - a.zIndex);
  }, [elements]);

  const handleReorder = (reorderedElements: DesignElement[]) => {
    // Update zIndex based on new order (reversed since highest zIndex is at top)
    const updatedElements = reorderedElements.map((el, index) => ({
      ...el,
      zIndex: reorderedElements.length - 1 - index,
    }));
    setElements(updatedElements);
  };

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-200 px-3 py-2">
        <span className="text-sm font-medium text-surface-700">Layers</span>
        <span className="text-xs text-surface-400">{elements.length} items</span>
      </div>

      {/* Layer Controls */}
      {selectedElement && (
        <div className="flex items-center justify-center gap-1 border-b border-surface-200 px-2 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => moveElementToTop(selectedElement.id)}
            title="Bring to Front"
            aria-label="Bring to front"
          >
            <ChevronsUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => moveElementUp(selectedElement.id)}
            title="Move Up"
            aria-label="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => moveElementDown(selectedElement.id)}
            title="Move Down"
            aria-label="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => moveElementToBottom(selectedElement.id)}
            title="Send to Back"
            aria-label="Send to back"
          >
            <ChevronsDown className="h-4 w-4" />
          </Button>
          <div className="mx-1 h-4 w-px bg-surface-200" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => duplicateElement(selectedElement.id)}
            title="Duplicate"
            aria-label="Duplicate element"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => deleteElement(selectedElement.id)}
            title="Delete"
            aria-label="Delete element"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto">
        {elements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Square className="mb-2 h-8 w-8 text-surface-300" />
            <p className="text-sm text-surface-500">No layers yet</p>
            <p className="text-xs text-surface-400">Add elements to see them here</p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={sortedElements}
            onReorder={handleReorder}
            className="divide-y divide-surface-100"
          >
            {sortedElements.map((element) => (
              <LayerItem
                key={element.id}
                element={element}
                isSelected={element.id === selectedElementId}
                onSelect={() => selectElement(element.id)}
                onToggleLock={() =>
                  element.locked
                    ? unlockElement(element.id)
                    : lockElement(element.id)
                }
                onToggleVisibility={() =>
                  element.hidden
                    ? showElement(element.id)
                    : hideElement(element.id)
                }
                onDelete={() => deleteElement(element.id)}
                onDuplicate={() => duplicateElement(element.id)}
              />
            ))}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}

// Individual layer item
interface LayerItemProps {
  element: DesignElement;
  isSelected: boolean;
  onSelect: () => void;
  onToggleLock: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function LayerItem({
  element,
  isSelected,
  onSelect,
  onToggleLock,
  onToggleVisibility,
  onDelete,
  onDuplicate,
}: LayerItemProps) {
  const IconComponent = ELEMENT_ICONS[element.type] || Square;

  // Get a display name for the element
  const displayName = useMemo(() => {
    if (element.type === "text" && element.content) {
      return element.content.slice(0, 20) + (element.content.length > 20 ? "..." : "");
    }
    return `${element.type.charAt(0).toUpperCase()}${element.type.slice(1)}`;
  }, [element]);

  return (
    <Reorder.Item
      value={element}
      id={element.id}
      className={`
        group flex items-center gap-2 px-2 py-2 transition-colors
        ${isSelected ? "bg-brand-50" : "hover:bg-surface-50"}
        ${element.hidden ? "opacity-50" : ""}
      `}
    >
      {/* Drag Handle */}
      <div className="cursor-grab text-surface-300 hover:text-surface-500 active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Element Icon */}
      <div
        className={`
          flex h-8 w-8 items-center justify-center rounded
          ${isSelected ? "bg-brand-100 text-brand-600" : "bg-surface-100 text-surface-500"}
        `}
      >
        <IconComponent className="h-4 w-4" />
      </div>

      {/* Element Name */}
      <button
        onClick={onSelect}
        className={`
          flex-1 truncate text-left text-sm
          ${isSelected ? "font-medium text-brand-700" : "text-surface-700"}
        `}
      >
        {displayName}
      </button>

      {/* Action Buttons */}
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        {/* Lock/Unlock */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          title={element.locked ? "Unlock" : "Lock"}
          aria-label={element.locked ? "Unlock element" : "Lock element"}
        >
          {element.locked ? (
            <Lock className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
          ) : (
            <Unlock className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </Button>

        {/* Show/Hide */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          title={element.hidden ? "Show" : "Hide"}
          aria-label={element.hidden ? "Show element" : "Hide element"}
        >
          {element.hidden ? (
            <EyeOff className="h-3.5 w-3.5 text-surface-400" aria-hidden="true" />
          ) : (
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* Lock indicator (always visible when locked) */}
      {element.locked && (
        <Lock className="h-3.5 w-3.5 text-amber-500 group-hover:hidden" />
      )}
    </Reorder.Item>
  );
}

// Compact version for smaller sidebars
export function LayersPanelCompact({ className = "" }: LayersPanelProps) {
  const { elements, selectedElementId, selectElement } = useEditorStore();

  const sortedElements = useMemo(() => {
    return [...elements].sort((a, b) => b.zIndex - a.zIndex);
  }, [elements]);

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="text-xs font-medium text-surface-500 px-2 py-1">
        Layers ({elements.length})
      </div>
      <div className="flex flex-col gap-0.5">
        {sortedElements.slice(0, 5).map((element) => {
          const IconComponent = ELEMENT_ICONS[element.type] || Square;
          return (
            <button
              key={element.id}
              onClick={() => selectElement(element.id)}
              className={`
                flex items-center gap-2 rounded px-2 py-1.5 text-left text-xs
                ${selectedElementId === element.id
                  ? "bg-brand-100 text-brand-700"
                  : "text-surface-600 hover:bg-surface-100"
                }
              `}
            >
              <IconComponent className="h-3.5 w-3.5" />
              <span className="truncate">
                {element.type === "text"
                  ? element.content.slice(0, 15)
                  : element.type}
              </span>
              {element.locked && <Lock className="h-3 w-3 text-amber-500" />}
              {element.hidden && <EyeOff className="h-3 w-3 text-surface-400" />}
            </button>
          );
        })}
        {elements.length > 5 && (
          <div className="px-2 py-1 text-xs text-surface-400">
            +{elements.length - 5} more
          </div>
        )}
      </div>
    </div>
  );
}
