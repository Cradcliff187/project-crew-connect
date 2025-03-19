
import { Subcontractor } from './types';

// Get the class names for performance indicators
export const getPerformanceIndicatorClass = (value: number | null, thresholds: { good: number, average: number }): string => {
  if (value === null) return 'text-gray-400';
  
  if (value >= thresholds.good) {
    return 'text-green-500';
  } else if (value >= thresholds.average) {
    return 'text-amber-500';
  } else {
    return 'text-red-500';
  }
};

// Simple function to get rating display
export const getRatingDisplay = (rating: number): string => {
  const stars = '★'.repeat(Math.floor(rating));
  const emptyStars = '☆'.repeat(5 - Math.floor(rating));
  return stars + emptyStars;
};

// Get display text for payment terms
export const getPaymentTermsLabel = (paymentTerms: string): string => {
  const terms: Record<string, string> = {
    'NET15': 'Net 15 Days',
    'NET30': 'Net 30 Days',
    'NET45': 'Net 45 Days',
    'NET60': 'Net 60 Days',
    'DUE_ON_RECEIPT': 'Due on Receipt'
  };
  
  return terms[paymentTerms] || paymentTerms;
};
