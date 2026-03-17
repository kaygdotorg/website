/**
 * Date formatting utilities for consistent date display across the site
 */

/** Short month names for compact date formatting */
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Full month names for verbose date formatting */
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Ensures a value is a Date object
 */
export function toDate(value: Date | string | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Format date as "21 Dec 2024"
 */
export function formatDate(date: Date | string | undefined): string {
  const d = toDate(date);
  if (!d) return '';

  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format date as "27 Nov, 2025" (with comma)
 */
export function formatDateWithComma(date: Date | string | undefined): string {
  const d = toDate(date);
  if (!d) return '';

  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}, ${d.getFullYear()}`;
}

/**
 * Format date as "December 2024" (full month name)
 */
export function formatMonth(date: Date | string | undefined): string {
  const d = toDate(date);
  if (!d) return '';

  return `${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Get relative time string (e.g., "3 days ago", "2 months ago")
 */
export function getRelativeTime(date: Date | string | undefined): string {
  const d = toDate(date);
  if (!d) return '';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  if (diffWeeks > 0) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  return 'just now';
}

/**
 * Get compact relative time string for "Updated X ago" badges.
 *
 * Returns null when the difference is less than 1 day (badge should not show).
 * Format: "Xd ago", "Xw ago", "Xmo ago", "Xy ago"
 */
export function getCompactRelativeTime(date: Date | string | undefined): string | null {
  const d = toDate(date);
  if (!d) return null;

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return null;

  const diffYears = Math.floor(diffDays / 365);
  if (diffYears > 0) return `${diffYears}y ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths > 0) return `${diffMonths}mo ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks > 0) return `${diffWeeks}w ago`;

  return `${diffDays}d ago`;
}

/**
 * Convert date to ISO string, handling both Date objects and strings
 */
export function toISOString(date: Date | string | undefined): string | undefined {
  const d = toDate(date);
  return d?.toISOString();
}
