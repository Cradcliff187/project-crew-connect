/**
 * Common types used throughout the application
 */

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
  | 'QUALIFIED'
  | 'VERIFIED'
  | 'draft'
  | 'sent'
  | 'approved'
  | 'rejected'
  | 'converted'
  | 'active'
  | 'inactive'
  | 'completed'
  | 'cancelled'
  | 'pending'
  | 'on_hold'
  | 'on-hold'
  | 'in_progress'
  | 'qualified'
  | 'verified'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'neutral'
  | 'purple'
  | 'unknown'
  | 'critical';

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

export interface DataTableProps<TData> {
  data: TData[];
  columns: any[];
  searchQuery?: string;
  searchFields?: string[];
  loading?: boolean;
  error?: string | null;
}

// Common type definitions used across the application

export type EntityType =
  | 'PROJECT'
  | 'ESTIMATE'
  | 'WORK_ORDER'
  | 'VENDOR'
  | 'SUBCONTRACTOR'
  | 'TIME_ENTRY'
  | 'EMPLOYEE';

export type DocumentCategory =
  // Estimate document types
  | 'quote'
  | 'proposal'
  | 'bid'
  | 'specification'
  // Project document types
  | 'contract'
  | 'photo'
  | 'permit'
  | 'plan'
  // Expense document types
  | 'receipt'
  | 'invoice'
  // Vendor/Subcontractor document types
  | 'certification'
  | 'insurance'
  // Other types
  | 'timesheet'
  | 'other';

export type ExpenseType = 'MATERIAL' | 'LABOR' | 'EQUIPMENT' | 'SUBCONTRACTOR' | 'OTHER';

export interface Vendor {
  id: string;
  name: string;
  vendorType?: string;
}

export interface Subcontractor {
  id: string;
  name: string;
}

export interface Employee {
  employee_id: string;
  first_name: string;
  last_name: string;
}

export interface DocumentMetadata {
  entityType: EntityType;
  entityId: string;
  category: DocumentCategory;
  tags?: string[];
  notes?: string;
  isExpense?: boolean;
  amount?: number;
  expenseDate?: Date;
  vendorId?: string;
  vendorName?: string;
  vendorType?: string;
  expenseType?: ExpenseType;
  budgetItemId?: string;
  version?: number;
  parentEntityType?: EntityType;
  parentEntityId?: string;
}
