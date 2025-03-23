
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
