
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency with $ sign
 */
export function formatCurrency(amount: number | string | undefined): string {
  if (amount === undefined || amount === null) return "$0.00";
  
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) return "$0.00";
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount);
}

/**
 * Formats a date to a readable format
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "—";
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date error";
  }
}

/**
 * Formats a file size from bytes to a human-readable format
 */
export function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  
  return `${formattedSize} ${sizes[i]}`;
}

/**
 * Gets a color scheme based on entity type
 */
export function getEntityColor(entityType?: string): string {
  if (!entityType) return 'gray';

  const normalizedType = entityType.toLowerCase();

  switch (normalizedType) {
    case 'project':
      return 'blue';
    case 'work_order':
    case 'workorder':
      return 'green';
    case 'estimate':
      return 'purple';
    case 'customer':
    case 'client':
      return 'indigo';
    case 'vendor':
      return 'amber';
    case 'subcontractor':
      return 'orange';
    case 'expense':
    case 'receipt':
      return 'red';
    default:
      return 'gray';
  }
}

/**
 * Formats a time range string from start and end times
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return '';
  
  // Parse 24-hour format times (HH:MM)
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  // Format to 12-hour format with AM/PM
  const formatTime = (hours: number, minutes: number): string => {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  const formattedStartTime = formatTime(startHour, startMinute);
  const formattedEndTime = formatTime(endHour, endMinute);
  
  return `${formattedStartTime} - ${formattedEndTime}`;
}

/**
 * Calculate days until due from a date string
 */
export function calculateDaysUntilDue(dueDateString?: string): number | null {
  if (!dueDateString) return null;
  
  try {
    const dueDate = new Date(dueDateString);
    const today = new Date();
    
    // Reset time components to compare just the dates
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    // Calculate the difference in milliseconds and convert to days
    const diffInMs = dueDate.getTime() - today.getTime();
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
    
    return diffInDays;
  } catch (error) {
    console.error("Error calculating days until due:", error);
    return null;
  }
}
