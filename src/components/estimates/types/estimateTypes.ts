
export interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost?: number;
  markup_percentage?: number;
  markup_amount?: number;
  item_type?: string;
  vendor_id?: string;
  subcontractor_id?: string;
  document_id?: string;
  notes?: string;
  revision_id?: string;
  original_item_id?: string;
  
  // For backward compatibility with older data
  total?: number;
}

export interface EstimateRevision {
  id: string;
  estimate_id: string;
  version: number;
  revision_date: string;
  sent_date?: string;
  notes?: string;
  status: string;
  is_current: boolean;
  amount?: number;
  revision_by?: string;
  document_id?: string;
  
  // Add the missing properties
  updated_at?: string;
  created_at?: string;
  sent_to?: string;
  
  // PDF document reference
  pdf_document_id?: string;
  
  // For backward compatibility with older data
  date?: string;
}

export type RevisionStatus = 
  | 'draft' 
  | 'ready'
  | 'sent' 
  | 'approved' 
  | 'rejected';

export interface RevisionChange {
  item_id: string;
  type: 'added' | 'modified' | 'removed';
  previous_value?: any;
  new_value?: any;
  field_name?: string;
}
