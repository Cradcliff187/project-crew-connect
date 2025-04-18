
// Define the base document type that will be used across different document types
export interface BaseDocument {
  document_id: string;
  file_name: string;
  file_type?: string | null;
  storage_path: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
  updated_at: string;
  url: string;
}

// WorkOrderDocument extends the base document with work order specific fields
export interface WorkOrderDocument extends BaseDocument {
  category?: string;
  tags?: string[];
  mime_type?: string | null;
  file_size?: number | null;
  uploaded_by?: string | null;
  version?: number;
  is_receipt?: boolean;
  amount?: number | null;
  vendor_id?: string | null;
  vendor_type?: string | null;
  expense_type?: string | null;
  notes?: string | null;
  expense_date?: string | null;
  is_expense?: boolean;
}

// VendorDocument is a type alias to WorkOrderDocument for backward compatibility
export type VendorDocument = WorkOrderDocument;
