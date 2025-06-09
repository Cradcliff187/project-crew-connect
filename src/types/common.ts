export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email?: string;
  role?: string;
  hourlyRate?: number;
  status?: string;
  // Add employee_id for backward compatibility with database structures
  employee_id?: string;
  phone?: string;
  cost_rate?: number | null;
  bill_rate?: number | null;
}

export type EntityType =
  | 'PROJECT'
  | 'ESTIMATE'
  | 'WORK_ORDER'
  | 'VENDOR'
  | 'SUBCONTRACTOR'
  | 'TIME_ENTRY'
  | 'EMPLOYEE'
  | 'CONTACT'
  | 'CUSTOMER'
  | 'EXPENSE'
  | 'ESTIMATE_ITEM'
  | 'CHANGE_ORDER';

export type DocumentCategory =
  | 'other'
  | 'invoice'
  | 'receipt'
  | '3rd_party_estimate'
  | 'contract'
  | 'insurance'
  | 'certification'
  | 'photo';

// Consolidated StatusType using UPPERCASE_SNAKE_CASE
export type StatusType =
  | 'NEW'
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'APPROVED'
  | 'REJECTED'
  | 'SENT'
  | 'READY' // Assuming this is distinct
  | 'PENDING'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'CONVERTED'
  | 'SUBMITTED' // From ChangeOrder map
  | 'REVIEW' // From ChangeOrder map
  | 'IMPLEMENTED' // From ChangeOrder map
  | 'QUALIFIED' // Keep potentially unique statuses
  | 'VERIFIED' // Keep potentially unique statuses
  | 'UNKNOWN'; // Keep unknown
// Removed lowercase duplicates and UI hints (success, warning, error, etc.)
// Color/icon mapping should happen in the component based on these semantic statuses.

export interface StatusOption {
  value: string; // Should ideally be StatusType, but UniversalStatusControl uses string keys
  label: string;
  color: string;
  description?: string;
}

export interface EntityWithStatus {
  id: string;
  status: StatusType;
  [key: string]: any;
}

// Add Vendor type needed by VendorSelectDialog
export interface Vendor {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  status?: string;
  vendorId?: string; // For backward compatibility with database
  vendorName?: string; // For backward compatibility with database
}

// Helper function for employee names
export function getEmployeeFullName(employee: Employee | null | undefined): string {
  if (!employee) return '';

  if (employee.name) return employee.name;

  return `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
}
