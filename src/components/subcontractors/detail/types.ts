
import { BaseDocument } from '@/components/workOrders/details/DocumentsList/types';

export interface SubcontractorDocument extends BaseDocument {
  entity_id?: string;
  entity_type?: string;
  updated_at?: string;
  
  // Additional fields for document management
  description?: string;
  size?: number;
  uploaded_by?: string;
  expires_at?: string;
  document_type?: 'insurance' | 'contract' | 'certification' | 'invoice' | 'other';
}
