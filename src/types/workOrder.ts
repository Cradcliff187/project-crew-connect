
import { StatusType } from './common';

export interface WorkOrder {
  work_order_id: string;
  title: string;
  description: string | null;
  customer_id: string | null;
  location_id: string | null;
  assigned_to: string | null;
  scheduled_date: string | null;
  completed_date: string | null;
  status: StatusType;
  priority: string | null;
  po_number: string | null;
  time_estimate: number | null;
  actual_hours: number | null;
  materials_cost: number | null;
  total_cost: number | null;
  progress: number | null;
  created_at: string;
  updated_at: string;
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
