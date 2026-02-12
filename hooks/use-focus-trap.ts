"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseFocusTrapOptions {
  enabled?: boolean;
  onEscape?: () => void;
  initialFocusRef?: React.RefObject<HTMLElement>;
  returnFocusOnDeactivate?: boolean;
}

/**
 * Hook for trapping focus within a container
 * Useful for modals, dialogs, and dropdown menus
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>({
  enabled = true,
  onEscape,
  initialFocusRef,
  returnFocusOnDeactivate = true,
}: UseFocusTrapOptions = {}) {
  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
      "[contenteditable]",
    ];

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors.join(","))
    ).filter((el) => {
      // Filter out hidden elements
      const style = getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    });
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || !containerRef.current) return;

      if (event.key === "Escape" && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab on first element -> go to last
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
        return;
      }

      // Tab on last element -> go to first
      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
        return;
      }
    },
    [enabled, onEscape, getFocusableElements]
  );

  // Store previous active element and set initial focus
  useEffect(() => {
    if (!enabled) return;

    previousActiveElement.current = document.activeElement as HTMLElement;

    // Set initial focus
    const focusableElements = getFocusableElements();
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else if (focusableElements.length > 0) {
      focusableElements[0]?.focus();
    } else {
      containerRef.current?.focus();
    }

    return () => {
      // Return focus when deactivated
      if (returnFocusOnDeactivate && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [enabled, getFocusableElements, initialFocusRef, returnFocusOnDeactivate]);

  // Add event listener
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, handleKeyDown]);

  return {
    containerRef,
    getFocusableElements,
  };
}

/**
 * Hook for managing roving tabindex pattern
 * Useful for arrow key navigation in lists and grids
 */
export function useRovingTabindex<T extends HTMLElement = HTMLElement>(
  itemCount: number,
  options: {
    orientation?: "horizontal" | "vertical" | "both";
    loop?: boolean;
    onSelect?: (index: number) => void;
  } = {}
) {
  const { orientation = "vertical", loop = true, onSelect } = options;
  const containerRef = useRef<T>(null);
  const currentIndex = useRef(0);

  const getItemElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>('[role="option"], [role="menuitem"], [role="tab"], [data-roving-item]')
    );
  }, []);

  const focusItem = useCallback(
    (index: number) => {
      const items = getItemElements();
      if (items.length === 0) return;

      let newIndex = index;
      if (loop) {
        newIndex = ((index % items.length) + items.length) % items.length;
      } else {
        newIndex = Math.max(0, Math.min(index, items.length - 1));
      }

      currentIndex.current = newIndex;
      items[newIndex]?.focus();
    },
    [getItemElements, loop]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const items = getItemElements();
      if (items.length === 0) return;

      let handled = false;

      switch (event.key) {
        case "ArrowDown":
          if (orientation === "vertical" || orientation === "both") {
            focusItem(currentIndex.current + 1);
            handled = true;
          }
          break;
        case "ArrowUp":
          if (orientation === "vertical" || orientation === "both") {
            focusItem(currentIndex.current - 1);
            handled = true;
          }
          break;
        case "ArrowRight":
          if (orientation === "horizontal" || orientation === "both") {
            focusItem(currentIndex.current + 1);
            handled = true;
          }
          break;
        case "ArrowLeft":
          if (orientation === "horizontal" || orientation === "both") {
            focusItem(currentIndex.current - 1);
            handled = true;
          }
          break;
        case "Home":
          focusItem(0);
          handled = true;
          break;
        case "End":
          focusItem(items.length - 1);
          handled = true;
          break;
        case "Enter":
        case " ":
          onSelect?.(currentIndex.current);
          handled = true;
          break;
      }

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [getItemElements, focusItem, orientation, onSelect]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const getItemProps = useCallback(
    (index: number) => ({
      tabIndex: index === currentIndex.current ? 0 : -1,
      "data-roving-item": true,
      onFocus: () => {
        currentIndex.current = index;
      },
    }),
    []
  );

  return {
    containerRef,
    getItemProps,
    focusItem,
    currentIndex: currentIndex.current,
  };
}
