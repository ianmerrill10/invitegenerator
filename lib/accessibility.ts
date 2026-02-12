/**
 * Accessibility utilities
 */

/**
 * Announce message to screen readers
 * Creates a live region that is announced by screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
): void {
  if (typeof document === "undefined") return;

  // Find or create the announcer element
  let announcer = document.getElementById("sr-announcer");

  if (!announcer) {
    announcer = document.createElement("div");
    announcer.id = "sr-announcer";
    announcer.setAttribute("aria-live", priority);
    announcer.setAttribute("aria-atomic", "true");
    announcer.setAttribute("role", "status");
    announcer.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    document.body.appendChild(announcer);
  } else {
    announcer.setAttribute("aria-live", priority);
  }

  // Clear and set new message (allows re-announcement of same message)
  announcer.textContent = "";
  setTimeout(() => {
    announcer!.textContent = message;
  }, 100);
}

/**
 * Get a unique ID for accessibility attributes
 */
let idCounter = 0;
export function generateA11yId(prefix: string = "a11y"): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Check if an element is currently visible
 */
export function isElementVisible(element: HTMLElement): boolean {
  const style = getComputedStyle(element);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0" &&
    element.offsetParent !== null
  );
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(
  container: HTMLElement | Document = document
): HTMLElement[] {
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
    container.querySelectorAll<HTMLElement>(focusableSelectors.join(","))
  ).filter(isElementVisible);
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-contrast: more)").matches;
}

/**
 * Check if user prefers dark color scheme
 */
export function prefersDarkColorScheme(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Focus the first focusable element in a container
 */
export function focusFirstFocusable(container: HTMLElement): boolean {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    focusableElements[0]?.focus();
    return true;
  }
  return false;
}

/**
 * Focus the last focusable element in a container
 */
export function focusLastFocusable(container: HTMLElement): boolean {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    focusableElements[focusableElements.length - 1]?.focus();
    return true;
  }
  return false;
}

/**
 * ARIA attribute helpers
 */
export const aria = {
  /**
   * Create aria-describedby value from multiple IDs
   */
  describedBy: (...ids: (string | undefined | null)[]): string | undefined => {
    const filtered = ids.filter(Boolean) as string[];
    return filtered.length > 0 ? filtered.join(" ") : undefined;
  },

  /**
   * Create aria-labelledby value from multiple IDs
   */
  labelledBy: (...ids: (string | undefined | null)[]): string | undefined => {
    const filtered = ids.filter(Boolean) as string[];
    return filtered.length > 0 ? filtered.join(" ") : undefined;
  },

  /**
   * Get expanded state for disclosure widgets
   */
  expanded: (isExpanded: boolean): "true" | "false" => (isExpanded ? "true" : "false"),

  /**
   * Get pressed state for toggle buttons
   */
  pressed: (isPressed: boolean): "true" | "false" => (isPressed ? "true" : "false"),

  /**
   * Get selected state for selectable items
   */
  selected: (isSelected: boolean): "true" | "false" => (isSelected ? "true" : "false"),

  /**
   * Get checked state for checkboxes/radios
   */
  checked: (isChecked: boolean | "mixed"): "true" | "false" | "mixed" => {
    if (isChecked === "mixed") return "mixed";
    return isChecked ? "true" : "false";
  },

  /**
   * Get current state for navigation items
   */
  current: (isCurrent: boolean | "page" | "step" | "location" | "date" | "time"): string | undefined => {
    if (typeof isCurrent === "boolean") {
      return isCurrent ? "true" : undefined;
    }
    return isCurrent;
  },

  /**
   * Get hidden state
   */
  hidden: (isHidden: boolean): "true" | undefined => (isHidden ? "true" : undefined),

  /**
   * Get disabled state
   */
  disabled: (isDisabled: boolean): "true" | undefined => (isDisabled ? "true" : undefined),

  /**
   * Get invalid state for form controls
   */
  invalid: (isInvalid: boolean): "true" | undefined => (isInvalid ? "true" : undefined),

  /**
   * Get required state for form controls
   */
  required: (isRequired: boolean): "true" | undefined => (isRequired ? "true" : undefined),

  /**
   * Get busy state for loading
   */
  busy: (isBusy: boolean): "true" | "false" => (isBusy ? "true" : "false"),
};

/**
 * Key codes for keyboard navigation
 */
export const Keys = {
  Enter: "Enter",
  Space: " ",
  Escape: "Escape",
  Tab: "Tab",
  ArrowUp: "ArrowUp",
  ArrowDown: "ArrowDown",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
  Home: "Home",
  End: "End",
  PageUp: "PageUp",
  PageDown: "PageDown",
  Backspace: "Backspace",
  Delete: "Delete",
} as const;

/**
 * Check if a keyboard event matches a specific key
 */
export function isKey(event: KeyboardEvent, key: keyof typeof Keys): boolean {
  return event.key === Keys[key];
}
