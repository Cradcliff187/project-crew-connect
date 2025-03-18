
import { StatusType } from '@/types/common';

// Define subcontractor type based on our database schema
export interface Subcontractor {
  subid: string;
  subname: string | null;
  contactemail: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  status: string | null;
  created_at: string | null;
  specialty_ids: string[] | null;
  // New fields for enhanced tracking
  rating?: number | null;
  insurance_expiry?: string | null;
  last_verified_date?: string | null;
  payment_terms?: string | null;
}

export interface Specialty {
  id: string;
  specialty: string;
}

export interface SubcontractorDocument {
  document_id: string;
  file_name: string;
  category: string;
  created_at: string;
  is_insurance?: boolean;
  expiry_date?: string | null;
  notes?: string | null;
}

export interface SubcontractorInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  amount: number;
  status: string;
  project_id?: string | null;
  project_name?: string | null;
  document_id?: string | null;
  payment_date?: string | null;
  due_date?: string | null;
}

// Map database status to StatusBadge component status
export const mapStatusToStatusBadge = (status: string | null): StatusType => {
  const statusMap: Record<string, StatusType> = {
    "ACTIVE": "active",
    "INACTIVE": "inactive",
    "QUALIFIED": "qualified",
    "PENDING": "pending",
    "REJECTED": "on-hold",
    "VERIFIED": "approved",
    "PAID": "completed",
    "UNPAID": "draft",
    "PARTIAL": "pending"
  };
  
  if (!status) return "unknown";
  
  return statusMap[status] || "unknown";
};

// Format date helper function
export const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(date);
};

// Filter subcontractors based on search query
export const filterSubcontractors = (subcontractors: Subcontractor[], searchQuery: string) => {
  return subcontractors.filter(sub => 
    (sub.subname?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (sub.contactemail?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (sub.subid?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );
};

// New utilities for subcontractor workflow

// Calculate days until insurance expiry
export const getDaysUntilExpiry = (expiryDate: string | null): number | null => {
  if (!expiryDate) return null;
  
  const expiry = new Date(expiryDate);
  const today = new Date();
  
  // Reset time portion for accurate day calculation
  expiry.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Get status of subcontractor's insurance
export const getInsuranceStatus = (expiryDate: string | null): 'valid' | 'expiring' | 'expired' | 'unknown' => {
  const daysRemaining = getDaysUntilExpiry(expiryDate);
  
  if (daysRemaining === null) return 'unknown';
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining < 30) return 'expiring';
  return 'valid';
};

// Format currency
export const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Get total invoiced amount for a subcontractor
export const getTotalInvoiced = (invoices: SubcontractorInvoice[]): number => {
  return invoices.reduce((total, invoice) => total + (invoice.amount || 0), 0);
};

// Get total paid amount for a subcontractor
export const getTotalPaid = (invoices: SubcontractorInvoice[]): number => {
  return invoices
    .filter(invoice => invoice.status === 'PAID')
    .reduce((total, invoice) => total + (invoice.amount || 0), 0);
};

// Get total outstanding amount for a subcontractor
export const getTotalOutstanding = (invoices: SubcontractorInvoice[]): number => {
  return invoices
    .filter(invoice => invoice.status !== 'PAID')
    .reduce((total, invoice) => total + (invoice.amount || 0), 0);
};
