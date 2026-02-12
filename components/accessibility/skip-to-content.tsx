"use client";

/**
 * Skip to Content Link
 *
 * Accessibility component that allows keyboard users to skip
 * navigation and go directly to the main content.
 *
 * Usage: Add <SkipToContent /> as the first child of your layout,
 * and ensure your main content has id="main-content"
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all"
    >
      Skip to main content
    </a>
  );
}

/**
 * Focus Trap
 *
 * Traps focus within a container - useful for modals and dialogs.
 * The container must have focusable elements.
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab" || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  return { handleKeyDown };
}

/**
 * Announcer for screen readers
 *
 * Creates a live region for announcing changes to screen reader users.
 */
export function ScreenReaderAnnouncer({ message, priority = "polite" }: {
  message: string;
  priority?: "polite" | "assertive";
}) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
