
export interface Document {
  document_id: string;
  file_name: string;
  storage_path: string;
  entity_type: string;
  entity_id: string;
  category: string;
  uploaded_by?: string;
  created_at: string;
  description?: string;
  is_expense?: boolean;
  amount?: number;
  version?: number;
  parent_document_id?: string;
  url?: string;
}
