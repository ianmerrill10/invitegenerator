"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// Using simple div for scrollable content
import {
  Layers,
  Type,
  Image,
  Square,
  Palette,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wand2,
  Library,
} from "lucide-react";

export type SidebarPanel =
  | "layers"
  | "elements"
  | "text"
  | "images"
  | "shapes"
  | "design"
  | "effects"
  | "settings"
  | "ai";

interface EditorSidebarProps {
  activePanel: SidebarPanel | null;
  onPanelChange: (panel: SidebarPanel | null) => void;
  children?: React.ReactNode;
  className?: string;
}

const sidebarItems: {
  id: SidebarPanel;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
}[] = [
  { id: "layers", label: "Layers", icon: Layers, shortcut: "L" },
  { id: "elements", label: "Elements", icon: Library, shortcut: "E" },
  { id: "text", label: "Text", icon: Type, shortcut: "T" },
  { id: "images", label: "Images", icon: Image, shortcut: "I" },
  { id: "shapes", label: "Shapes", icon: Square, shortcut: "S" },
  { id: "design", label: "Design", icon: Palette, shortcut: "D" },
  { id: "effects", label: "Effects", icon: Sparkles, shortcut: "F" },
  { id: "ai", label: "AI Assistant", icon: Wand2, shortcut: "A" },
  { id: "settings", label: "Settings", icon: Settings },
];

export function EditorSidebar({
  activePanel,
  onPanelChange,
  children,
  className,
}: EditorSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const handlePanelClick = (panel: SidebarPanel) => {
    if (activePanel === panel) {
      onPanelChange(null);
    } else {
      onPanelChange(panel);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn("flex h-full", className)}>
        {/* Icon bar */}
        <div className="flex flex-col w-12 bg-surface-50 border-r">
          <div className="flex-1 py-2">
            {sidebarItems.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={activePanel === item.id ? "secondary" : "ghost"}
                    size="icon"
                    className={cn(
                      "w-10 h-10 mx-auto my-0.5",
                      activePanel === item.id && "bg-primary/10 text-primary"
                    )}
                    onClick={() => handlePanelClick(item.id)}
                  >
                    <item.icon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>
                    {item.label}
                    {item.shortcut && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({item.shortcut})
                      </span>
                    )}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Collapse toggle */}
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 mx-auto"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Panel content */}
        {activePanel && !collapsed && (
          <div className="w-72 border-r bg-background flex flex-col">
            <div className="h-12 px-4 border-b flex items-center justify-between">
              <h3 className="font-medium text-sm">
                {sidebarItems.find((i) => i.id === activePanel)?.label}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onPanelChange(null)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto">{children}</div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

// Sidebar panel wrapper
interface SidebarPanelContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SidebarPanelContent({
  children,
  className,
}: SidebarPanelContentProps) {
  return <div className={cn("p-4 space-y-4", className)}>{children}</div>;
}

// Sidebar section
interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function SidebarSection({
  title,
  children,
  action,
  className,
}: SidebarSectionProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </h4>
        {action}
      </div>
      {children}
    </div>
  );
}
