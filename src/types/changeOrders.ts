export type ChangeOrderStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'IMPLEMENTED'
  | 'CANCELLED';

export type ChangeOrderEntityType = 'PROJECT' | 'WORK_ORDER';

export interface ChangeOrderItem {
  id?: string;
  change_order_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost: number;
  markup_percentage?: number | null;
  markup_amount?: number | null;
  gross_margin?: number | null;
  gross_margin_percentage?: number | null;
  item_type: string;
  vendor_id?: string | null;
  subcontractor_id?: string | null;
  custom_type?: string | null;
  document_id?: string | null;
  expense_type?: string | null;
  trade_type?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ChangeOrder {
  id: string;
  entity_type: ChangeOrderEntityType;
  entity_id: string;
  title: string;
  description?: string;
  requested_by?: string;
  requested_date?: string;
  status?: ChangeOrderStatus;
  approved_by?: string;
  approved_date?: string;
  approval_notes?: string;
  total_amount?: number | null;
  cost_impact?: number | null;
  revenue_impact?: number | null;
  original_completion_date?: string;
  new_completion_date?: string;
  change_order_number?: string;
  document_id?: string;
  items?: ChangeOrderItem[];
  created_at?: string;
  updated_at?: string;
}

export interface ChangeOrderStatusHistory {
  id: string;
  change_order_id: string;
  status: ChangeOrderStatus;
  previous_status?: ChangeOrderStatus;
  changed_by?: string;
  changed_date: string;
  notes?: string;
  created_at: string;
}
