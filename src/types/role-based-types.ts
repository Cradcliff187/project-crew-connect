// Role-Based Time Tracking Types
// These types extend the existing Supabase types with new role-based functionality

export type UserRole = 'admin' | 'field_user';

// Enhanced Employee type with role-based fields
export interface RoleBasedEmployee {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  status: string | null;
  user_id: string | null;
  app_role: UserRole;
  bill_rate: number | null;
  cost_rate: number | null;
  hourly_rate: number | null;
  default_bill_rate: boolean | null;
  created_at: string;
  updated_at: string;
}

// Enhanced Time Entry type with overtime and processing fields
export interface RoleBasedTimeEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  date_worked: string;
  start_time: string;
  end_time: string;
  hours_worked: number;
  hours_regular: number;
  hours_ot: number;
  employee_id: string;
  employee_rate: number | null;
  cost_rate: number | null;
  bill_rate: number | null;
  notes: string | null;
  has_receipts: boolean | null;
  location_data: any | null;
  total_cost: number | null;
  total_billable: number | null;
  project_budget_item_id: string | null;
  // New role-based fields
  processed_at: string | null;
  processed_by: string | null;
  receipt_id: string | null;
  created_at: string;
  updated_at: string;
}

// Receipt type for OCR and expense tracking
export interface Receipt {
  id: string;
  employee_id: string;
  project_id: string | null;
  work_order_id: string | null;
  amount: number;
  merchant: string | null;
  tax: number | null;
  currency: string;
  receipt_date: string | null;
  ocr_raw: any | null;
  ocr_confidence: number | null;
  ocr_processed_at: string | null;
  storage_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Activity Log type for audit trail
export interface ActivityLog {
  id: number;
  entry_id: string;
  user_id: string | null;
  action: 'create' | 'update' | 'delete' | 'process' | 'unprocess';
  payload: any | null;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
  created_at: string;
}

// Form types for role-based interfaces
export interface QuickLogFormData {
  entity_type: 'project' | 'work_order';
  entity_id: string;
  date_worked: Date;
  start_time: string;
  end_time: string;
  notes?: string;
  has_receipts?: boolean;
}

export interface ReceiptFormData {
  amount: number;
  merchant?: string;
  tax?: number;
  receipt_date: Date;
  project_id?: string;
  work_order_id?: string;
  file: File;
}

// UI State types
export interface TimeEntryFilters {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  employee_id?: string;
  entity_type?: string;
  processed?: boolean;
}

export interface AdminTimeEntryView extends RoleBasedTimeEntry {
  employee_name: string;
  entity_name: string;
  can_process: boolean;
}

export interface FieldUserAssignment {
  id: string;
  title: string;
  entity_type: 'project' | 'work_order';
  entity_id: string;
  due_date?: string;
  priority?: 'high' | 'medium' | 'low';
  status: string;
  description?: string;
  location?: string;
}

// Hook return types
export interface UseRoleBasedTimeEntriesReturn {
  timeEntries: RoleBasedTimeEntry[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  createTimeEntry: (data: QuickLogFormData) => Promise<void>;
  updateTimeEntry: (id: string, data: Partial<RoleBasedTimeEntry>) => Promise<void>;
  processTimeEntry: (id: string) => Promise<void>;
  unprocessTimeEntry: (id: string) => Promise<void>;
}

export interface UseReceiptsReturn {
  receipts: Receipt[];
  isLoading: boolean;
  error: Error | null;
  uploadReceipt: (data: ReceiptFormData) => Promise<Receipt>;
  deleteReceipt: (id: string) => Promise<void>;
}

export interface UseActivityLogReturn {
  activities: ActivityLog[];
  isLoading: boolean;
  error: Error | null;
}

// Component prop types
export interface TimeEntryCardProps {
  timeEntry: RoleBasedTimeEntry;
  onEdit?: (timeEntry: RoleBasedTimeEntry) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  variant?: 'field' | 'admin';
}

export interface QuickLogWizardProps {
  onComplete: (data: QuickLogFormData) => void;
  onCancel: () => void;
  assignments?: FieldUserAssignment[];
}

export interface ReceiptWizardProps {
  onComplete: (data: ReceiptFormData) => void;
  onCancel: () => void;
  timeEntryId?: string;
}

export interface AdminTimeEntryTableProps {
  timeEntries: AdminTimeEntryView[];
  filters: TimeEntryFilters;
  onFiltersChange: (filters: TimeEntryFilters) => void;
  onProcessEntry: (id: string) => void;
  onUnprocessEntry: (id: string) => void;
  onEditEntry: (timeEntry: RoleBasedTimeEntry) => void;
}

// Utility types
export type TimeEntryStatus = 'draft' | 'submitted' | 'processed';
export type OvertimeCalculation = {
  regular: number;
  overtime: number;
  total: number;
};

// Constants
export const USER_ROLES = {
  ADMIN: 'admin' as const,
  FIELD_USER: 'field_user' as const,
} as const;

export const TIME_ENTRY_ACTIONS = {
  CREATE: 'create' as const,
  UPDATE: 'update' as const,
  DELETE: 'delete' as const,
  PROCESS: 'process' as const,
  UNPROCESS: 'unprocess' as const,
} as const;
