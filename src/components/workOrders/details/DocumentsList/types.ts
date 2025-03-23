
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
  updated_at: string; // Make this required to fix the error
  url?: string;
  is_receipt?: boolean;
  vendor_id?: string; // Added to support vendor document relations
  expense_type?: string; // Added to track expense types
  entity_id: string; // Make this required for consistency
  entity_type: string; // Make this required for consistency
}

// Vendor-specific document interface
export interface VendorDocument extends BaseDocument {
  // No need to redefine these as they're now required in BaseDocument
  // entity_id is already required in BaseDocument
  // entity_type is already required in BaseDocument
  vendor_type?: string;
}
