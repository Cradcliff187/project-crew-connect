
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
  mime_type?: string | null;
  file_size?: number | null;
  uploaded_by?: string | null;
  version?: number;
  amount?: number | null;
  vendor_id?: string | null;
  vendor_type?: string | null;
  expense_type?: string | null;
  notes?: string | null;
  expense_date?: string | null;
  is_expense?: boolean;
}
