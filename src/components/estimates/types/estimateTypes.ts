
export type EstimateItem = {
  id: string;
  estimate_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type?: string;
  vendor_id?: string;
  subcontractor_id?: string;
  document_id?: string;
  // Phase 3 fields
  trade_type?: string;
  expense_type?: string;
  custom_type?: string;
};

export type EstimateRevision = {
  id: string;
  estimate_id: string;
  version: number;
  revision_date: string;
  revision_by: string | null;
  notes: string | null;
  amount: number | null;
};
