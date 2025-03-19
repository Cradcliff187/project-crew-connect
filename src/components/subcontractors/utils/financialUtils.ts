
/**
 * Get payment terms display label
 */
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

/**
 * Format currency with dollar sign
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(amount);
};
