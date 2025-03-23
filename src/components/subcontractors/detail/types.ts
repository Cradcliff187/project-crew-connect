
import { BaseDocument } from '@/components/workOrders/details/DocumentsList/types';

export interface SubcontractorDocument extends BaseDocument {
  // Since BaseDocument now requires updated_at, entity_id, and entity_type,
  // we don't need to redefine them here, but we must include them in our data
  
  // Additional fields for document management
  description?: string;
  size?: number;
  uploaded_by?: string;
  expires_at?: string;
  document_type?: 'insurance' | 'contract' | 'certification' | 'invoice' | 'other';
}
