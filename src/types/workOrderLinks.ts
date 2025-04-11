
export interface WorkOrderProjectLink {
  id: string;
  work_order_id: string;
  project_id: string;
  budget_item_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkOrderLinkDetail {
  project_id: string;
  budget_item_id: string | null;
}
