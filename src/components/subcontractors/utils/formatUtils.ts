
import { Subcontractor } from './types';

// Format subcontractor address
export const formatSubcontractorAddress = (subcontractor: Subcontractor): string => {
  const addressParts = [];
  if (subcontractor.address) addressParts.push(subcontractor.address);
  
  let cityStateZip = '';
  if (subcontractor.city) cityStateZip += subcontractor.city;
  if (subcontractor.state) {
    if (cityStateZip) cityStateZip += ', ';
    cityStateZip += subcontractor.state;
  }
  if (subcontractor.zip) {
    if (cityStateZip) cityStateZip += ' ';
    cityStateZip += subcontractor.zip;
  }
  
  if (cityStateZip) addressParts.push(cityStateZip);
  
  return addressParts.join('\n');
};

// Format currency with dollar sign
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(amount);
};

// Format a date or return 'N/A' if null
export const formatDate = (date: string | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(new Date(date));
  } catch (error) {
    return 'Invalid date';
  }
};

// Get payment terms display label
export const getPaymentTermsLabel = (paymentTerms: string | null): string => {
  switch(paymentTerms) {
    case 'NET15':
      return 'Net 15 Days';
    case 'NET30':
      return 'Net 30 Days';
    case 'NET45':
      return 'Net 45 Days';
    case 'NET60':
      return 'Net 60 Days';
    case 'DUE_ON_RECEIPT':
      return 'Due On Receipt';
    default:
      return paymentTerms || 'Not Specified';
  }
};

// Get subcontractor rating display
export const getRatingDisplay = (rating: number | null): string => {
  if (rating === null) return 'Not Rated';
  
  const stars = '★'.repeat(Math.floor(rating));
  const remainder = rating % 1;
  const halfStar = remainder >= 0.5 ? '½' : '';
  
  return `${stars}${halfStar} (${rating})`;
};
