
export interface VendorProject {
  project_id: string;
  project_name: string;
  status: string;
  created_at: string;
}

export interface VendorWorkOrder {
  work_order_id: string;
  title: string;
  status: string;
  materials_cost: number;
  created_at: string;
}

export interface VendorDocument {
  document_id: string;
  file_name: string;
  category?: string;
  created_at: string;
  updated_at: string;
  file_type?: string | null;
  storage_path: string;
  entity_id: string;
  entity_type: string;
  url?: string;
}
