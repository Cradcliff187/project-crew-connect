
import { Subcontractor } from './types';

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
