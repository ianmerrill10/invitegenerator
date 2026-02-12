"use client";

import { useEffect, useCallback } from "react";
import { useEditorStore, EDITOR_SHORTCUTS } from "@/lib/stores";

interface UseEditorShortcutsOptions {
  enabled?: boolean;
  onSave?: () => void;
  onPreview?: () => void;
}

export function useEditorShortcuts(options: UseEditorShortcutsOptions = {}) {
  const { enabled = true, onSave, onPreview } = options;

  const {
    selectedElementId,
    undo,
    redo,
    canUndo,
    canRedo,
    copyElement,
    cutElement,
    pasteElement,
    deleteElement,
    duplicateElement,
    moveElementUp,
    moveElementDown,
    moveElementToTop,
    moveElementToBottom,
    selectElement,
    elements,
    setZoom,
    zoom,
    resetView,
    toggleGrid,
    clipboard,
  } = useEditorStore();

  // Parse keyboard shortcut string
  const parseShortcut = useCallback((shortcut: string) => {
    const parts = shortcut.toLowerCase().split("+");
    return {
      ctrl: parts.includes("ctrl"),
      meta: parts.includes("meta"),
      shift: parts.includes("shift"),
      alt: parts.includes("alt"),
      key: parts[parts.length - 1],
    };
  }, []);

  // Check if event matches shortcut
  const matchesShortcut = useCallback(
    (event: KeyboardEvent, shortcuts: string[]) => {
      for (const shortcut of shortcuts) {
        const parsed = parseShortcut(shortcut);
        const keyMatches =
          event.key.toLowerCase() === parsed.key ||
          event.code.toLowerCase() === `key${parsed.key}` ||
          event.code.toLowerCase() === parsed.key;

        if (
          keyMatches &&
          event.ctrlKey === parsed.ctrl &&
          event.metaKey === parsed.meta &&
          event.shiftKey === parsed.shift &&
          event.altKey === parsed.alt
        ) {
          return true;
        }
      }
      return false;
    },
    [parseShortcut]
  );

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Skip if typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Undo
      if (matchesShortcut(event, EDITOR_SHORTCUTS.undo)) {
        event.preventDefault();
        if (canUndo()) {
          undo();
        }
        return;
      }

      // Redo
      if (matchesShortcut(event, EDITOR_SHORTCUTS.redo)) {
        event.preventDefault();
        if (canRedo()) {
          redo();
        }
        return;
      }

      // Copy
      if (matchesShortcut(event, EDITOR_SHORTCUTS.copy)) {
        event.preventDefault();
        if (selectedElementId) {
          copyElement(selectedElementId);
        }
        return;
      }

      // Cut
      if (matchesShortcut(event, EDITOR_SHORTCUTS.cut)) {
        event.preventDefault();
        if (selectedElementId) {
          cutElement(selectedElementId);
        }
        return;
      }

      // Paste
      if (matchesShortcut(event, EDITOR_SHORTCUTS.paste)) {
        event.preventDefault();
        if (clipboard) {
          pasteElement();
        }
        return;
      }

      // Delete
      if (matchesShortcut(event, EDITOR_SHORTCUTS.delete)) {
        event.preventDefault();
        if (selectedElementId) {
          deleteElement(selectedElementId);
        }
        return;
      }

      // Duplicate
      if (matchesShortcut(event, EDITOR_SHORTCUTS.duplicate)) {
        event.preventDefault();
        if (selectedElementId) {
          duplicateElement(selectedElementId);
        }
        return;
      }

      // Select All
      if (matchesShortcut(event, EDITOR_SHORTCUTS.selectAll)) {
        event.preventDefault();
        // Select all elements (multi-select feature)
        return;
      }

      // Deselect
      if (matchesShortcut(event, EDITOR_SHORTCUTS.deselect)) {
        event.preventDefault();
        selectElement(null);
        return;
      }

      // Move Up (increase z-index)
      if (matchesShortcut(event, EDITOR_SHORTCUTS.moveUp)) {
        event.preventDefault();
        if (selectedElementId) {
          moveElementUp(selectedElementId);
        }
        return;
      }

      // Move Down (decrease z-index)
      if (matchesShortcut(event, EDITOR_SHORTCUTS.moveDown)) {
        event.preventDefault();
        if (selectedElementId) {
          moveElementDown(selectedElementId);
        }
        return;
      }

      // Move to Top
      if (matchesShortcut(event, EDITOR_SHORTCUTS.moveToTop)) {
        event.preventDefault();
        if (selectedElementId) {
          moveElementToTop(selectedElementId);
        }
        return;
      }

      // Move to Bottom
      if (matchesShortcut(event, EDITOR_SHORTCUTS.moveToBottom)) {
        event.preventDefault();
        if (selectedElementId) {
          moveElementToBottom(selectedElementId);
        }
        return;
      }

      // Zoom In
      if (matchesShortcut(event, EDITOR_SHORTCUTS.zoomIn)) {
        event.preventDefault();
        setZoom(zoom + 0.1);
        return;
      }

      // Zoom Out
      if (matchesShortcut(event, EDITOR_SHORTCUTS.zoomOut)) {
        event.preventDefault();
        setZoom(zoom - 0.1);
        return;
      }

      // Reset Zoom
      if (matchesShortcut(event, EDITOR_SHORTCUTS.resetZoom)) {
        event.preventDefault();
        resetView();
        return;
      }

      // Toggle Grid
      if (matchesShortcut(event, EDITOR_SHORTCUTS.toggleGrid)) {
        event.preventDefault();
        toggleGrid();
        return;
      }

      // Save (custom handler)
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "s") {
          event.preventDefault();
          onSave?.();
          return;
        }

        // Preview
        if (event.key === "p" && event.shiftKey) {
          event.preventDefault();
          onPreview?.();
          return;
        }
      }

      // Arrow keys for nudging elements
      if (selectedElementId && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        const element = elements.find((el) => el.id === selectedElementId);
        if (element && !element.locked) {
          const step = event.shiftKey ? 10 : 1;
          const updates: { position: { x: number; y: number } } = {
            position: { ...element.position },
          };

          switch (event.key) {
            case "ArrowUp":
              updates.position.y -= step;
              break;
            case "ArrowDown":
              updates.position.y += step;
              break;
            case "ArrowLeft":
              updates.position.x -= step;
              break;
            case "ArrowRight":
              updates.position.x += step;
              break;
          }

          useEditorStore.getState().updateElement(selectedElementId, updates);
        }
        return;
      }
    },
    [
      matchesShortcut,
      canUndo,
      canRedo,
      undo,
      redo,
      selectedElementId,
      copyElement,
      cutElement,
      pasteElement,
      deleteElement,
      duplicateElement,
      moveElementUp,
      moveElementDown,
      moveElementToTop,
      moveElementToBottom,
      selectElement,
      setZoom,
      zoom,
      resetView,
      toggleGrid,
      clipboard,
      elements,
      onSave,
      onPreview,
    ]
  );

  // Attach event listener
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return {
    shortcuts: EDITOR_SHORTCUTS,
  };
}

// Helper component to show keyboard shortcuts
export function ShortcutKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 items-center justify-center rounded border border-surface-200 bg-surface-100 px-1.5 text-[10px] font-medium text-surface-600">
      {children}
    </kbd>
  );
}

// Shortcuts reference panel
export function ShortcutsReference() {
  const isMac = typeof navigator !== "undefined" && navigator.platform.includes("Mac");
  const cmdKey = isMac ? "⌘" : "Ctrl";

  const shortcuts = [
    { action: "Undo", keys: [`${cmdKey}+Z`] },
    { action: "Redo", keys: [`${cmdKey}+Y`, `${cmdKey}+Shift+Z`] },
    { action: "Copy", keys: [`${cmdKey}+C`] },
    { action: "Cut", keys: [`${cmdKey}+X`] },
    { action: "Paste", keys: [`${cmdKey}+V`] },
    { action: "Delete", keys: ["Delete", "Backspace"] },
    { action: "Duplicate", keys: [`${cmdKey}+D`] },
    { action: "Deselect", keys: ["Escape"] },
    { action: "Bring Forward", keys: [`${cmdKey}+]`] },
    { action: "Send Backward", keys: [`${cmdKey}+[`] },
    { action: "Bring to Front", keys: [`${cmdKey}+Shift+]`] },
    { action: "Send to Back", keys: [`${cmdKey}+Shift+[`] },
    { action: "Zoom In", keys: [`${cmdKey}++`] },
    { action: "Zoom Out", keys: [`${cmdKey}+-`] },
    { action: "Reset Zoom", keys: [`${cmdKey}+0`] },
    { action: "Toggle Grid", keys: [`${cmdKey}+'`] },
    { action: "Nudge", keys: ["Arrow Keys"] },
    { action: "Nudge (10px)", keys: ["Shift+Arrow Keys"] },
  ];

  return (
    <div className="space-y-1 text-sm">
      <h4 className="font-medium text-surface-700 mb-2">Keyboard Shortcuts</h4>
      {shortcuts.map(({ action, keys }) => (
        <div key={action} className="flex items-center justify-between py-1">
          <span className="text-surface-600">{action}</span>
          <div className="flex gap-1">
            {keys.map((key, i) => (
              <span key={i}>
                {i > 0 && <span className="text-surface-400 mx-1">or</span>}
                <ShortcutKey>{key}</ShortcutKey>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
