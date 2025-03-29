
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
  id: string;
  change_order_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type?: string;
  vendor_id?: string;
  subcontractor_id?: string;
  document_id?: string;
  trade_type?: string;
  expense_type?: string;
  custom_type?: string;
  impact_days: number;
  created_at: string;
  updated_at: string;
}

export interface ChangeOrder {
  id: string;
  entity_type: ChangeOrderEntityType;
  entity_id: string;
  title: string;
  description?: string;
  requested_by?: string;
  requested_date: string;
  status: ChangeOrderStatus;
  approved_by?: string;
  approved_date?: string;
  approval_notes?: string;
  total_amount: number;
  impact_days: number;
  original_completion_date?: string;
  new_completion_date?: string;
  change_order_number: string;
  document_id?: string;
  created_at: string;
  updated_at: string;
  items?: ChangeOrderItem[];
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
