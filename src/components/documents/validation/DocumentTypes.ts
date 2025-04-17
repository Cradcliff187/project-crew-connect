
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
}
