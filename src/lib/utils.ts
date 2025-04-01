
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
