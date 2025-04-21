// Time Entry Interfaces
export interface TimeEntry {
  id: string;
  entity_type: 'work_order' | 'project'; // Using string literal types for consistency
  entity_id: string;
  entity_name?: string;
  entity_location?: string;
  date_worked: string;
  start_time: string;
  end_time: string;
  hours_worked: number;
  notes?: string;
  employee_id?: string;
  employee_name?: string;
  employee_rate?: number;
  cost?: number;
  total_cost?: number;
  has_receipts?: boolean;
  location_data?: any;
  created_at: string;
  updated_at: string;
  documents?: any[];
}

// Form data for creating/updating time entries
export interface TimeEntryFormValues {
  entityType: 'work_order' | 'project';
  entityId: string;
  workDate: Date;
  startTime: string;
  endTime: string;
  hoursWorked: number;
  notes?: string;
  employeeId?: string;
  hasReceipts: boolean;
}

export type QuickLogFormValues = {
  entityType: 'work_order' | 'project';
  entityId: string;
  startTime: string;
  endTime: string;
  hoursWorked: number;
  notes?: string;
};

export interface TimeEntryReceipt {
  id: string;
  time_entry_id: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  storage_path: string;
  uploaded_at: string;
  document_id?: string;
  url?: string;
  expense_type?: string;
  vendor_id?: string;
  amount?: number;
}

// Time grouping for better UX
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimeOption {
  value: string; // 24h format value (e.g. "14:30")
  display: string; // 12h format display (e.g. "2:30 PM")
  timeOfDay: TimeOfDay;
}

// Receipt metadata for better integration with expense tracking
export interface ReceiptMetadata {
  category: string;
  expenseType: string | null;
  tags: string[];
  vendorId?: string;
  vendorType?: 'vendor' | 'subcontractor' | 'other';
  amount?: number;
}

// Entity types for use in the useEntityData hook
export interface Entity {
  id: string;
  name: string;
  status?: string;
}

export interface EntityDetails {
  name: string;
  type: 'work_order' | 'project';
  location?: string;
}
