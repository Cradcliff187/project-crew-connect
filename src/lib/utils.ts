
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return "$0";
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getFileIconByType(fileType: string): string {
  const type = fileType.toLowerCase();
  
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('image') || type.includes('jpg') || type.includes('jpeg') || type.includes('png')) return 'image';
  if (type.includes('excel') || type.includes('spreadsheet') || type.includes('xls')) return 'spreadsheet';
  if (type.includes('word') || type.includes('doc')) return 'document';
  
  return 'file';
}

/**
 * Format a time range from start and end time strings
 * @param startTime Start time in 24h format (e.g. "09:00")
 * @param endTime End time in 24h format (e.g. "17:00")
 * @returns Formatted time range (e.g. "9:00 AM - 5:00 PM")
 */
export function formatTimeRange(startTime?: string, endTime?: string): string {
  if (!startTime || !endTime) return "N/A";
  
  try {
    // Parse hours and minutes
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // Create date objects to use date-fns formatting
    const today = new Date();
    const startDate = new Date(today);
    startDate.setHours(startHour, startMinute, 0);
    
    const endDate = new Date(today);
    endDate.setHours(endHour, endMinute, 0);
    
    // Format the times
    const formattedStart = format(startDate, "h:mm a");
    const formattedEnd = format(endDate, "h:mm a");
    
    return `${formattedStart} - ${formattedEnd}`;
  } catch (error) {
    console.error("Error formatting time range:", error);
    return "Invalid time range";
  }
}

/**
 * Calculate the number of days until a due date
 * @param dueDate Due date string in ISO format
 * @returns Number of days until due (negative if overdue), or null if no due date
 */
export function calculateDaysUntilDue(dueDate?: string | null): number | null {
  if (!dueDate) return null;
  
  try {
    const due = new Date(dueDate);
    const today = new Date();
    
    // Reset hours to make sure we're just comparing days
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.error("Error calculating days until due:", error);
    return null;
  }
}
