
// Extending the types to include the fields we're using
export interface WorkOrder {
  work_order_id: string;
  title: string;
  description?: string | null;
  status: 'NEW' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  customer_id?: string | null;
  location_id?: string | null;
  scheduled_date?: string | null;
  due_by_date?: string | null;
  completed_date?: string | null;
  time_estimate?: number | null;
  actual_hours: number;
  materials_cost: number;
  total_cost: number;
  expenses_cost?: number;
  progress: number;
  created_at: string;
  updated_at: string;
  po_number?: string | null;
  work_order_number?: string | null;
  assigned_to?: string | null;
  project_id?: string | null;
}

export interface WorkOrderExpense {
  id: string;
  work_order_id?: string;
  entity_id?: string; // For expenses table compatibility
  entity_type?: string; // For expenses table compatibility
  vendor_id?: string | null;
  expense_name: string;
  material_name?: string; // For backward compatibility
  description?: string; // For expenses table compatibility
  quantity: number;
  unit_price: number;
  total_price: number;
  amount?: number; // For expenses table compatibility 
  receipt_document_id?: string | null;
  document_id?: string | null; // For expenses table compatibility
  created_at: string;
  updated_at: string;
  expense_type: string; // 'MATERIAL', 'LABOR', etc.
  source_type: 'material' | 'time_entry' | string; // Updated to allow string for type safety
  time_entry_id?: string | null;
}

// Alias for backward compatibility
export type WorkOrderMaterial = WorkOrderExpense;
