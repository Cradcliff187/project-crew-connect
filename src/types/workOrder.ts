
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
  progress: number; // Added this property to fix the TypeScript errors
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
