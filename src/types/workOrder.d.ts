
export interface WorkOrder {
  work_order_id: string;
  title: string;
  description?: string;
  customer_id?: string;
  location_id?: string;
  assigned_to?: string;
  scheduled_date?: string;
  completed_date?: string;
  status: string;
  priority: string;
  time_estimate?: number;
  actual_hours: number;
  materials_cost: number;
  total_cost: number;
  progress: number;
  po_number?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkOrderTimelog {
  id: string;
  work_order_id: string;
  employee_id?: string;
  hours_worked: number;
  work_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

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
