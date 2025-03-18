
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
  progress?: number; // Add progress property
}
