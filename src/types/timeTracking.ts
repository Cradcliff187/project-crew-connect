// Time Entry Interfaces
export interface TimeEntry {
  id: string;
  entity_type: 'work_order' | 'project';
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
  has_receipts?: boolean;
  location_data?: any;
  created_at: string;
  updated_at: string;
}

// Form data for creating/updating time entries
export interface TimeEntryFormData {
  entity_type: 'work_order' | 'project';
  entity_id: string;
  date_worked: Date;
  start_time: string;
  end_time: string;
  hours_worked: number;
  notes?: string;
  employee_id?: string;
  receipts?: File[];
  location_data?: any;
}

export interface TimeEntryReceipt {
  id: string;
  time_entry_id: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  storage_path: string;
  uploaded_at: string;
}

// Time grouping for better UX
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimeOption {
  value: string;      // 24h format value (e.g. "14:30")
  display: string;    // 12h format display (e.g. "2:30 PM")
  timeOfDay: TimeOfDay;
}
