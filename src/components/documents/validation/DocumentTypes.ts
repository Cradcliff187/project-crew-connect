
export interface Document {
  id?: string;
  document_id?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  file_url?: string;
  url?: string; // Some documents might use url instead of file_url
  storage_path?: string;
  entity_type?: string;
  entity_id?: string;
  uploaded_by?: string;
  created_at?: string;
  description?: string;
  category?: string;
  tags?: string[];
  notes?: string;
  amount?: number;
  expense_date?: string;
  version?: number;
  is_expense?: boolean;
  is_latest_version?: boolean;
  vendor_id?: string;
  vendor_type?: string;
  expense_type?: string;
  budget_item_id?: string;
  parent_entity_type?: string;
  parent_entity_id?: string;
  parent_document_id?: string;
}
