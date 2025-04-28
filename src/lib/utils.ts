import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return 'N/A';

  let dateToParse = dateString;
  // Check if the string includes time/timezone info (e.g., contains 'T' or '+')
  if (dateString.includes('T') || dateString.includes('+')) {
    // Extract only the date part (YYYY-MM-DD)
    dateToParse = dateString.split('T')[0];
  }

  // Now parse the guaranteed date-only string, adding T12:00:00 for local context
  const date = new Date(`${dateToParse}T12:00:00`);

  // Check if date parsing was successful
  if (isNaN(date.getTime())) {
    console.error(
      `[formatDate] Failed to parse date string after extraction: ${dateToParse} (original: ${dateString})`
    );
    return 'Invalid Date';
  }

  // Format the valid date object
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format hours to display with proper precision
 */
export function formatHours(hours: number | undefined | null): string {
  if (hours === undefined || hours === null) return '0h';

  return `${Number(hours).toFixed(1)}h`;
}

/**
 * Format file size in bytes to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Calculate days until due date
 */
export function calculateDaysUntilDue(dueDate: string | null): number | null {
  if (!dueDate) return null;

  const today = new Date();
  const due = new Date(dueDate);

  // Reset time part for accurate day calculation
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Format time range for display
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const startFormat = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(start);

  const endFormat = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(end);

  return `${startFormat} - ${endFormat}`;
}

/**
 * Get color for entity type
 */
export function getEntityColor(entityType: string): string {
  const type = entityType?.toUpperCase() || '';

  switch (type) {
    case 'PROJECT':
      return 'blue';
    case 'ESTIMATE':
      return 'purple';
    case 'VENDOR':
      return 'emerald';
    case 'CUSTOMER':
      return 'cyan';
    case 'WORK_ORDER':
      return 'amber';
    case 'SUBCONTRACTOR':
      return 'green';
    case 'EXPENSE':
      return 'red';
    default:
      return 'gray';
  }
}
