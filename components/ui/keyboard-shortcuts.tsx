"use client";

import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, Search, Plus, Save, Eye, Share2, Trash2, Copy, ArrowLeft } from "lucide-react";

interface ShortcutAction {
  key: string;
  description: string;
  action: () => void;
  icon?: React.ReactNode;
  category: "navigation" | "editing" | "actions" | "general";
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
  };
}

interface KeyboardShortcutsProps {
  shortcuts?: ShortcutAction[];
  enabled?: boolean;
}

const defaultShortcuts: ShortcutAction[] = [
  {
    key: "k",
    description: "Open command palette",
    action: () => {},
    icon: <Command className="h-4 w-4" />,
    category: "general",
    modifiers: { ctrl: true },
  },
  {
    key: "/",
    description: "Focus search",
    action: () => {},
    icon: <Search className="h-4 w-4" />,
    category: "general",
    modifiers: { ctrl: true },
  },
  {
    key: "n",
    description: "New invitation",
    action: () => {},
    icon: <Plus className="h-4 w-4" />,
    category: "actions",
    modifiers: { ctrl: true },
  },
  {
    key: "s",
    description: "Save changes",
    action: () => {},
    icon: <Save className="h-4 w-4" />,
    category: "editing",
    modifiers: { ctrl: true },
  },
  {
    key: "p",
    description: "Preview invitation",
    action: () => {},
    icon: <Eye className="h-4 w-4" />,
    category: "editing",
    modifiers: { ctrl: true },
  },
  {
    key: "e",
    description: "Share invitation",
    action: () => {},
    icon: <Share2 className="h-4 w-4" />,
    category: "actions",
    modifiers: { ctrl: true, shift: true },
  },
  {
    key: "Backspace",
    description: "Delete selected",
    action: () => {},
    icon: <Trash2 className="h-4 w-4" />,
    category: "editing",
  },
  {
    key: "d",
    description: "Duplicate selected",
    action: () => {},
    icon: <Copy className="h-4 w-4" />,
    category: "editing",
    modifiers: { ctrl: true },
  },
  {
    key: "Escape",
    description: "Close dialog / Deselect",
    action: () => {},
    icon: <ArrowLeft className="h-4 w-4" />,
    category: "general",
  },
  {
    key: "?",
    description: "Show keyboard shortcuts",
    action: () => {},
    category: "general",
    modifiers: { shift: true },
  },
];

export function useKeyboardShortcuts(
  shortcuts: ShortcutAction[],
  enabled: boolean = true
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow Escape key in inputs
        if (event.key !== "Escape") return;
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.modifiers?.ctrl
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.modifiers?.shift
          ? event.shiftKey
          : !event.shiftKey || shortcut.key === "?";
        const altMatch = shortcut.modifiers?.alt ? event.altKey : !event.altKey;

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          shiftMatch &&
          altMatch
        ) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
  shortcuts = defaultShortcuts,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts?: ShortcutAction[];
}) {
  const categories = {
    general: "General",
    navigation: "Navigation",
    editing: "Editing",
    actions: "Actions",
  };

  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {} as Record<string, ShortcutAction[]>
  );

  const renderKey = (shortcut: ShortcutAction) => {
    const keys: string[] = [];
    if (shortcut.modifiers?.ctrl) keys.push("Ctrl");
    if (shortcut.modifiers?.shift) keys.push("Shift");
    if (shortcut.modifiers?.alt) keys.push("Alt");
    keys.push(shortcut.key === " " ? "Space" : shortcut.key);
    return keys;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {categories[category as keyof typeof categories]}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut) => (
                  <div
                    key={shortcut.key + shortcut.description}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      {shortcut.icon && (
                        <span className="text-muted-foreground">{shortcut.icon}</span>
                      )}
                      <span className="text-sm">{shortcut.description}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderKey(shortcut).map((key, index) => (
                        <span key={index}>
                          {index > 0 && (
                            <span className="text-muted-foreground mx-1">+</span>
                          )}
                          <kbd className="px-2 py-1 text-xs font-semibold bg-muted border rounded">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground text-center">
            Press <kbd className="px-2 py-0.5 text-xs font-semibold bg-muted border rounded mx-1">?</kbd>{" "}
            at any time to show this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function KeyboardShortcutsProvider({
  children,
  shortcuts = defaultShortcuts,
  enabled = true,
}: {
  children: React.ReactNode;
  shortcuts?: ShortcutAction[];
  enabled?: boolean;
}) {
  const [showDialog, setShowDialog] = useState(false);

  // Add the help shortcut
  const allShortcuts = [
    ...shortcuts,
    {
      key: "?",
      description: "Show keyboard shortcuts",
      action: () => setShowDialog(true),
      category: "general" as const,
      modifiers: { shift: true },
    },
  ];

  useKeyboardShortcuts(allShortcuts, enabled);

  return (
    <>
      {children}
      <KeyboardShortcutsDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        shortcuts={allShortcuts}
      />
    </>
  );
}

export default KeyboardShortcutsProvider;
