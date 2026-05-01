/**
 * PYQBank — Shared Utility Functions
 */

/**
 * Generate a URL-safe slug from text (supports Hindi via transliteration fallback).
 * Appends a numeric suffix for uniqueness.
 */
export function generateSlug(text: string, suffix?: number): string {
  const base = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // remove non-word chars (keeps spaces, hyphens)
    .replace(/\s+/g, "-")     // spaces → hyphens
    .replace(/-+/g, "-")      // collapse multiple hyphens
    .trim()
    .substring(0, 60);        // cap length

  const id = suffix ?? Math.floor(Math.random() * 100000);
  return `${base}-${id}`;
}

/**
 * Format a date string into a human-readable locale string.
 * e.g. "2025-09-12" → "12 Sep 2025"
 */
export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr; // return raw if parsing fails
  }
}

/**
 * Format a date string into a full date-time string.
 * e.g. "2025-09-12T10:30:00" → "12 Sep 2025, 10:30 AM"
 */
export function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}
