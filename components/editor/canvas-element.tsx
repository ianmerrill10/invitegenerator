"use client";

import { useState, useEffect, useRef } from "react";
import { DesignElement } from "@/types";
import { useEditorStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

interface CanvasElementProps {
  element: DesignElement;
}

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export function CanvasElement({ element }: CanvasElementProps) {
  const { 
    selectedElementId, 
    selectElement, 
    updateElement,
    zoom 
  } = useEditorStore();

  const isSelected = selectedElementId === element.id;
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });

  // Handle Dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;

      updateElement(element.id, {
        position: {
          x: Math.max(0, initialPos.x + dx),
          y: Math.max(0, initialPos.y + dy),
        },
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, initialPos, element.id, updateElement, zoom]);

  // Handle Resizing
  useEffect(() => {
    if (!isResizing || !resizeHandle) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;

      let newWidth = initialSize.width;
      let newHeight = initialSize.height;
      let newX = initialPos.x;
      let newY = initialPos.y;

      // Calculate new dimensions based on handle
      switch (resizeHandle) {
        case "e":
          newWidth = Math.max(20, initialSize.width + dx);
          break;
        case "w":
          newWidth = Math.max(20, initialSize.width - dx);
          newX = initialPos.x + (initialSize.width - newWidth);
          break;
        case "s":
          newHeight = Math.max(20, initialSize.height + dy);
          break;
        case "n":
          newHeight = Math.max(20, initialSize.height - dy);
          newY = initialPos.y + (initialSize.height - newHeight);
          break;
        case "se":
          newWidth = Math.max(20, initialSize.width + dx);
          newHeight = Math.max(20, initialSize.height + dy);
          break;
        case "sw":
          newWidth = Math.max(20, initialSize.width - dx);
          newHeight = Math.max(20, initialSize.height + dy);
          newX = initialPos.x + (initialSize.width - newWidth);
          break;
        case "ne":
          newWidth = Math.max(20, initialSize.width + dx);
          newHeight = Math.max(20, initialSize.height - dy);
          newY = initialPos.y + (initialSize.height - newHeight);
          break;
        case "nw":
          newWidth = Math.max(20, initialSize.width - dx);
          newHeight = Math.max(20, initialSize.height - dy);
          newX = initialPos.x + (initialSize.width - newWidth);
          newY = initialPos.y + (initialSize.height - newHeight);
          break;
      }

      updateElement(element.id, {
        position: { x: newX, y: newY },
        size: { width: newWidth, height: newHeight },
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeHandle(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, resizeHandle, dragStart, initialPos, initialSize, element.id, updateElement, zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (element.locked) return;
    e.stopPropagation();
    selectElement(element.id);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos({ x: element.position.x, y: element.position.y });
  };

  const handleResizeStart = (e: React.MouseEvent, handle: ResizeHandle) => {
    if (element.locked) return;
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos({ x: element.position.x, y: element.position.y });
    setInitialSize({ width: element.size.width, height: element.size.height });
  };

  // Base styles
  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: element.position.x,
    top: element.position.y,
    width: element.size.width,
    height: element.size.height,
    transform: `rotate(${element.rotation || 0}deg)`,
    opacity: element.opacity ?? 1,
    zIndex: element.zIndex,
    cursor: isDragging ? "grabbing" : "grab",
  };

  // Render Content based on type
  const renderContent = () => {
    switch (element.type) {
      case "text":
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              color: element.style.color,
              fontSize: `${element.style.fontSize}px`,
              fontFamily: element.style.fontFamily,
              fontWeight: element.style.fontWeight,
              fontStyle: element.style.fontStyle,
              textAlign: element.style.textAlign,
              textDecoration: element.style.textDecoration,
              display: "flex",
              alignItems: "center", // Center vertically for now
              justifyContent: element.style.textAlign === "center" ? "center" : element.style.textAlign === "right" ? "flex-end" : "flex-start",
              whiteSpace: "pre-wrap",
              pointerEvents: "none", // Let clicks pass to container
            }}
          >
            {element.content}
          </div>
        );

      case "image":
        return (
          <img
            src={element.content}
            alt=""
            className="w-full h-full object-cover pointer-events-none"
            style={{
              borderRadius: element.style.borderRadius,
              borderWidth: element.style.borderWidth,
              borderColor: element.style.borderColor,
              borderStyle: element.style.borderStyle,
            }}
          />
        );

      case "shape":
        return (
          <div
            className="w-full h-full pointer-events-none"
            style={{
              backgroundColor: element.style.backgroundColor,
              borderRadius: element.style.borderRadius,
              borderWidth: element.style.borderWidth,
              borderColor: element.style.borderColor,
              borderStyle: element.style.borderStyle,
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={elementRef}
      style={baseStyle}
      onMouseDown={handleMouseDown}
      className={cn(
        "group",
        !element.locked && "hover:outline hover:outline-1 hover:outline-blue-300",
        isSelected && "outline outline-2 outline-blue-500",
        element.locked && "cursor-not-allowed opacity-80"
      )}
    >
      {renderContent()}
      
      {/* Selection Handles (Only when selected and not locked) */}
      {isSelected && !element.locked && (
        <>
          {/* Corner Handles */}
          <div 
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-nw-resize z-10"
            onMouseDown={(e) => handleResizeStart(e, "nw")}
          />
          <div 
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-ne-resize z-10"
            onMouseDown={(e) => handleResizeStart(e, "ne")}
          />
          <div 
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-sw-resize z-10"
            onMouseDown={(e) => handleResizeStart(e, "sw")}
          />
          <div 
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-se-resize z-10"
            onMouseDown={(e) => handleResizeStart(e, "se")}
          />
          
          {/* Edge Handles */}
          <div 
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-white border border-blue-500 rounded-sm cursor-n-resize z-10"
            onMouseDown={(e) => handleResizeStart(e, "n")}
          />
          <div 
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-white border border-blue-500 rounded-sm cursor-s-resize z-10"
            onMouseDown={(e) => handleResizeStart(e, "s")}
          />
          <div 
            className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-6 bg-white border border-blue-500 rounded-sm cursor-w-resize z-10"
            onMouseDown={(e) => handleResizeStart(e, "w")}
          />
          <div 
            className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-6 bg-white border border-blue-500 rounded-sm cursor-e-resize z-10"
            onMouseDown={(e) => handleResizeStart(e, "e")}
          />
        </>
      )}
    </div>
  );
}
