import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  if (!dateString) return "—";
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return "Invalid date";
  
  if (isToday(date)) {
    return `Today at ${format(date, "h:mm a")}`;
  } else if (isYesterday(date)) {
    return `Yesterday at ${format(date, "h:mm a")}`;
  } else {
    return format(date, "MMM d, yyyy");
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format a time range in a human-readable format
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return "Invalid time range";
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "Invalid time range";
  
  return `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
}

/**
 * Calculate days until due from a due date
 */
export function calculateDaysUntilDue(dueDate: string | null): number | null {
  if (!dueDate) return null;
  
  const today = new Date();
  const due = new Date(dueDate);
  
  if (isNaN(due.getTime())) return null;
  
  return differenceInDays(due, today);
}

// Add this new function for entity colors
export function getEntityColor(entityType?: string): string {
  if (!entityType) return 'gray';
  
  switch (entityType.toUpperCase()) {
    case 'PROJECT':
      return 'blue';
    case 'WORK_ORDER':
      return 'green';
    case 'ESTIMATE':
      return 'purple';
    case 'CUSTOMER':
      return 'orange';
    case 'VENDOR':
      return 'amber';
    case 'SUBCONTRACTOR':
      return 'emerald';
    case 'EXPENSE':
      return 'red';
    default:
      return 'gray';
  }
}
