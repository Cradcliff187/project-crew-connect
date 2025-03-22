
export interface SubcontractorDocument {
  document_id: string;
  file_name: string;
  category: string | null;
  created_at: string;
  file_type: string | null;
  storage_path?: string;
  url?: string;
  is_receipt?: boolean;
  
  // Additional fields for document management
  description?: string;
  size?: number;
  uploaded_by?: string;
  expires_at?: string;
  document_type?: 'insurance' | 'contract' | 'certification' | 'invoice' | 'other';
}
