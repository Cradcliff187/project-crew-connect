
export interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost?: number;
  markup_percentage?: number;
  markup_amount?: number;
  gross_margin?: number;
  gross_margin_percentage?: number;
  estimate_id?: string;
  revision_id?: string;
  original_item_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EstimateRevision {
  id: string;
  estimate_id: string;
  version: number;
  revision_date: string;
  amount?: number;
  status?: string;
  is_current?: boolean;
  notes?: string;
  pdf_document_id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}
