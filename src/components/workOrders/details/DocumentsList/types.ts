
// Add this file to define the VendorDocument type

export interface VendorDocument {
  document_id: string;
  file_name: string;
  file_type?: string | null;
  storage_path: string;
  url: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
  updated_at: string;
  category?: string;
  tags?: string[];
}
