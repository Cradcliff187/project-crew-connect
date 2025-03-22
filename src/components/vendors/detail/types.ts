
export interface VendorDocument {
  document_id: string;
  file_name: string;
  category: string | null;
  created_at: string;
  file_type: string | null;
  storage_path?: string;
  url?: string;
  is_receipt?: boolean;
}

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
  created_at: string;
  materials_cost: number;
}
