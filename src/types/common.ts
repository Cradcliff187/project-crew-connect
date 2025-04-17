
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email?: string;
  role?: string;
  hourlyRate?: number;
  status?: string;
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

// Add the missing StatusType that's being imported by many components
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
  | 'converted';

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
