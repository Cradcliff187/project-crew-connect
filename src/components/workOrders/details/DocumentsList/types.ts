
export interface WorkOrderDocument {
  document_id: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  storage_path: string;
  category?: string;
  entity_id: string;
  entity_type: string;
  created_at: string;
  updated_at: string;
  is_receipt?: boolean;
  url: string;
}

// A more generic document interface that can be extended by different entity types
export interface BaseDocument {
  document_id: string;
  file_name: string;
  file_type: string | null;
  file_size?: number;
  storage_path: string; // Making this required to match WorkOrderDocument
  category?: string | null;
  created_at: string;
  url?: string;
  is_receipt?: boolean;
}
