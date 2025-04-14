// Get payment terms label
export const getPaymentTermsLabel = (term: string): string => {
  const terms: Record<string, string> = {
    NET15: 'Net 15 Days',
    NET30: 'Net 30 Days',
    NET45: 'Net 45 Days',
    NET60: 'Net 60 Days',
    DUE_ON_RECEIPT: 'Due On Receipt',
  };

  return terms[term] || term;
};

// Format vendor address for display
export const formatVendorAddress = (vendor: any): string | null => {
  if (!vendor.address && !vendor.city && !vendor.state && !vendor.zip) {
    return null;
  }

  let formattedAddress = '';

  if (vendor.address) {
    formattedAddress += vendor.address + '\n';
  }

  const cityStateZip = [vendor.city, vendor.state, vendor.zip].filter(Boolean).join(', ');

  if (cityStateZip) {
    formattedAddress += cityStateZip;
  }

  return formattedAddress || null;
};

// Format date for display
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Map status to StatusBadge variant
export const mapStatusToStatusBadge = (status: string | null): string => {
  if (!status) return 'unknown';

  // Convert to lowercase for case-insensitive comparison
  const statusLower = status.toLowerCase();

  switch (statusLower) {
    case 'active':
      return 'active';
    case 'inactive':
      return 'inactive';
    default:
      return 'unknown';
  }
};
