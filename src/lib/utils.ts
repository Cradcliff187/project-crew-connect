
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateInput: string | Date) {
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error("Date parsing error:", error);
    return 'Invalid date';
  }
}

export function formatDateTime(dateInput: string | Date) {
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    return format(date, 'MMM d, yyyy h:mm a');
  } catch (error) {
    console.error("Date parsing error:", error);
    return 'Invalid date';
  }
}

export function formatCurrency(amount: number | null | undefined) {
  if (amount === null || amount === undefined) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}
