
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
  | 'ESTIMATE_ITEM';

export type DocumentCategory = 
  | 'other'
  | 'invoice'
  | 'receipt'
  | '3rd_party_estimate'
  | 'contract'
  | 'insurance'
  | 'certification'
  | 'photo';

// Modified to include all status types across the application
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
  | 'READY'
  | 'PENDING'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'CONVERTED'
  | 'draft'
  | 'sent'
  | 'approved'
  | 'rejected'
  | 'converted'
  | 'active'
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'on-hold'
  | 'inactive'
  | 'unknown'
  // UI status values for display
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'purple'
  | 'qualified'
  | 'verified'
  | 'in_progress';

export interface StatusOption {
  value: string;
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
export function getEmployeeFullName(employee: Employee): string {
  if (employee.name) return employee.name;
  return `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
}
