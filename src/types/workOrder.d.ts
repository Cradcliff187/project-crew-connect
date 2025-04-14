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
  expenses_cost?: number;
  labor_cost?: number;
  actual_hours?: number;
  time_estimate?: number;
  progress: number;
  work_order_number?: string;
  due_by_date?: string;
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

export interface WorkOrderExpense {
  id: string;
  work_order_id: string;
  vendor_id: string | null;
  expense_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  receipt_document_id: string | null;
  created_at: string;
  updated_at: string;
  expense_type?: string;
}

// For backward compatibility during transition
export type WorkOrderMaterial = WorkOrderExpense;
