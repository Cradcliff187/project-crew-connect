export interface BaseDocument {
  document_id: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  storage_path: string;
  url: string;
  entity_id: string;
  entity_type: string;
  created_at: string;
  updated_at: string;
  category?: string;
  is_receipt?: boolean;
  tags?: string[];
  uploaded_by?: string;
  version?: number;
  is_latest_version?: boolean;
  parent_document_id?: string;
}

export interface WorkOrderDocument extends BaseDocument {
  // Additional fields specific to work order documents can be added here
}
