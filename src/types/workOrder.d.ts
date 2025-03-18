
import { StatusType } from './common';

export interface WorkOrder {
  work_order_id: string;
  title: string;
  description?: string;
  status: StatusType;
  priority?: string;
  scheduled_date?: string;
  customer_id?: string;
  location_id?: string;
  created_at: string;
  completed_date?: string;
  po_number?: string;
  assigned_to?: string;
  total_cost?: number;
  materials_cost?: number;
  labor_cost?: number;
  actual_hours?: number;
  time_estimate?: number;
  progress: number;
}

export interface WorkOrderTimelog {
  id: string;
  work_order_id: string;
  employee_id: string | null;
  hours_worked: number;
  work_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkOrderMaterial {
  id: string;
  work_order_id: string;
  vendor_id: string | null;
  material_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  receipt_document_id: string | null;
  created_at: string;
  updated_at: string;
}

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
