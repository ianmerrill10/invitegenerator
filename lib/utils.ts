import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO, isValid, isBefore, differenceInDays } from "date-fns";

// ============================================
// CLASS NAME UTILITIES
// ============================================

/**
 * Combines class names with Tailwind CSS merge support.
 * Uses clsx for conditional classes and tailwind-merge to resolve conflicts.
 *
 * @param inputs - Class values (strings, arrays, objects, or conditionals)
 * @returns Merged class name string with Tailwind conflicts resolved
 *
 * @example
 * cn("px-2 py-1", "px-4") // "py-1 px-4"
 * cn("text-red-500", isActive && "text-blue-500")
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================
// DATE UTILITIES
// ============================================

/**
 * Format a date string to a human-readable format
 */
export function formatDate(date: string | Date, formatStr: string = "PPP"): string {
  // `date-fns/format` uses the local timezone.
  // When an ISO string is provided (e.g., from `toISOString()`), formatting in local time
  // can shift the day depending on the user's timezone. To keep output stable, we convert
  // the UTC components into a "local" Date before formatting.
  if (typeof date === "string") {
    const parsed = parseISO(date);
    if (!isValid(parsed)) return "Invalid date";
    const utcAsLocal = new Date(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
      parsed.getUTCHours(),
      parsed.getUTCMinutes(),
      parsed.getUTCSeconds(),
      parsed.getUTCMilliseconds()
    );
    return format(utcAsLocal, formatStr);
  }

  if (!isValid(date)) return "Invalid date";
  return format(date, formatStr);
}

/**
 * Format a date as relative time (e.g., "2 days ago")
 */
export function formatRelativeDate(date: string | Date): string {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsedDate)) return "Invalid date";
  return formatDistanceToNow(parsedDate, { addSuffix: true });
}

/**
 * Format event date and time
 */
export function formatEventDateTime(date: string, time?: string): string {
  const dateStr = formatDate(date, "EEEE, MMMM d, yyyy");
  if (time) {
    return `${dateStr} at ${time}`;
  }
  return dateStr;
}

/**
 * Get days until event
 */
export function getDaysUntilEvent(eventDate: string): number {
  const date = parseISO(eventDate);
  if (!isValid(date)) return 0;
  return differenceInDays(date, new Date());
}

/**
 * Check if event date has passed
 */
export function isEventPast(eventDate: string): boolean {
  const date = parseISO(eventDate);
  if (!isValid(date)) return false;
  return isBefore(date, new Date());
}

/**
 * Check if RSVP deadline has passed
 */
export function isRSVPDeadlinePast(deadline?: string): boolean {
  if (!deadline) return false;
  const date = parseISO(deadline);
  if (!isValid(date)) return false;
  return isBefore(date, new Date());
}

// ============================================
// STRING UTILITIES
// ============================================

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to title case
 */
export function toTitleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (!str) return "";
  if (maxLength <= 0) return "";
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

/**
 * Generate a slug from a string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Format event type for display
 */
export function formatEventType(type: string): string {
  return type
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
}

// ============================================
// NUMBER UTILITIES
// ============================================

/**
 * Format a number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Clamp a number between min and max
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 * Accepts common US formats like 1234567890, 123-456-7890, (123) 456-7890
 */
export function isValidPhone(phone: string): boolean {
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) return true;
  return digitsOnly.length === 10;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// URL UTILITIES
// ============================================

/**
 * Generate invitation share URL
 */
export function getInvitationShareUrl(invitationId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://invitegenerator.com";
  return `${baseUrl}/i/${invitationId}`;
}

/**
 * Generate RSVP URL
 */
export function getRSVPUrl(invitationId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://invitegenerator.com";
  return `${baseUrl}/rsvp/${invitationId}`;
}

/**
 * Generate Google Maps URL from location
 */
export function getGoogleMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/**
 * Generate add to calendar URL (Google Calendar)
 */
export function getAddToCalendarUrl(event: {
  title: string;
  date: string;
  time?: string;
  endDate?: string;
  endTime?: string;
  location?: string;
  description?: string;
}): string {
  const startDateTime = event.time 
    ? `${event.date.replace(/-/g, "")}T${event.time.replace(":", "")}00`
    : event.date.replace(/-/g, "");
  
  const endDateTime = event.endDate && event.endTime
    ? `${event.endDate.replace(/-/g, "")}T${event.endTime.replace(":", "")}00`
    : startDateTime;
  
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${startDateTime}/${endDateTime}`,
    ...(event.location && { location: event.location }),
    ...(event.description && { details: event.description }),
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ============================================
// ARRAY UTILITIES
// ============================================

/**
 * Remove duplicates from array
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Group array items by key
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] ?? [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by key
 */
export function sortBy<T>(arr: T[], key: keyof T, order: "asc" | "desc" = "asc"): T[] {
  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
}

// ============================================
// COLOR UTILITIES
// ============================================

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Check if color is light or dark
 */
export function isLightColor(color: string): boolean {
  const rgb = hexToRgb(color);
  if (!rgb) return true;
  
  // Using relative luminance formula
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

/**
 * Get contrasting text color (black or white)
 */
export function getContrastColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? "#000000" : "#FFFFFF";
}

// ============================================
// STORAGE UTILITIES
// ============================================

/**
 * Safe localStorage getter
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safe localStorage setter
 */
export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error setting localStorage:", error);
  }
}

/**
 * Remove item from localStorage
 */
export function removeLocalStorage(key: string): void {
  if (typeof window === "undefined") return;
  
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from localStorage:", error);
  }
}

// ============================================
// RANDOM UTILITIES
// ============================================

/**
 * Generate a random ID
 */
export function generateId(length: number = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a random color
 */
export function randomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
}

/**
 * Get random item from array
 */
export function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
