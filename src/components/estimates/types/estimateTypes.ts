
export interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost?: number;
  markup_percentage?: number;
  markup_amount?: number;
  item_type?: string;
  vendor_id?: string;
  subcontractor_id?: string;
  document_id?: string;
  notes?: string;
  revision_id?: string;
}

export interface EstimateRevision {
  id: string;
  estimate_id: string;
  version: number;
  revision_date: string;
  sent_date?: string;
  notes?: string;
  status: string;
  is_current: boolean;
  amount?: number;
  revision_by?: string;
  document_id?: string;
}
