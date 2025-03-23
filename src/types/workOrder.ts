
// Extending the types to include the fields we're using
export interface WorkOrder {
  work_order_id: string;
  title: string;
  description?: string;
  status: 'NEW' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  customer_id?: string;
  location_id?: string;
  scheduled_date?: string;
  due_by_date?: string;
  completed_date?: string;
  time_estimate?: number;
  actual_hours: number;
  materials_cost: number;
  total_cost: number;
  expenses_cost?: number;
  progress: number;
  created_at: string;
  updated_at: string;
  po_number?: string;
  work_order_number?: string;
  assigned_to?: string;
  project_id?: string;
}

export interface WorkOrderExpense {
  id: string;
  work_order_id: string;
  vendor_id?: string | null;
  expense_name: string;
  material_name?: string; // For backward compatibility
  quantity: number;
  unit_price: number;
  total_price: number;
  receipt_document_id?: string | null;
  created_at: string;
  updated_at: string;
  expense_type: string; // 'material', 'labor', etc.
  source_type: 'material' | 'time_entry';
  time_entry_id?: string | null;
}

// Alias for backward compatibility
export type WorkOrderMaterial = WorkOrderExpense;
