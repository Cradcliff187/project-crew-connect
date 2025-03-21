
import { Vendor } from '../VendorsTable';
import { StatusType } from '@/types/common';

// Format date in a consistent way
export const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(date);
};

// Map database status to StatusBadge component status
export const mapStatusToStatusBadge = (status: string | null): StatusType => {
  const statusMap: Record<string, StatusType> = {
    "active": "active",
    "inactive": "inactive",
    "qualified": "qualified",
    "pending": "pending",
    "new": "pending",
    "on_hold": "on-hold",
    "preferred": "qualified",
    "PENDING": "pending",
    "QUALIFIED": "qualified",
    "ACTIVE": "active",
    "INACTIVE": "inactive",
    "REJECTED": "rejected",
    "VERIFIED": "qualified",
    "PREFERRED": "qualified",
    "REVIEW_NEEDED": "on-hold"
  };
  
  if (!status) return "unknown";
  
  return statusMap[status] || "unknown";
};

// Format vendor address for display
export const formatVendorAddress = (vendor: Vendor): string | null => {
  if (!vendor.address && !vendor.city && !vendor.state && !vendor.zip) {
    return null;
  }

  let formattedAddress = '';
  
  if (vendor.address) {
    formattedAddress += vendor.address + '\n';
  }
  
  const cityStateZip = [
    vendor.city,
    vendor.state,
    vendor.zip
  ]
    .filter(Boolean)
    .join(', ');
  
  if (cityStateZip) {
    formattedAddress += cityStateZip;
  }
  
  return formattedAddress || null;
};

// Get payment terms label
export const getPaymentTermsLabel = (term: string): string => {
  const terms: Record<string, string> = {
    'NET15': 'Net 15 Days',
    'NET30': 'Net 30 Days',
    'NET45': 'Net 45 Days',
    'NET60': 'Net 60 Days',
    'DUE_ON_RECEIPT': 'Due On Receipt',
  };
  
  return terms[term] || term;
};
