
import { BaseDocument } from '@/components/workOrders/details/DocumentsList/types';

export interface SubcontractorDocument extends BaseDocument {
  // Additional fields for subcontractor document management
  description?: string;
  size?: number;
  uploaded_by?: string;
  expires_at?: string;
  document_type?: 'insurance' | 'contract' | 'certification' | 'invoice' | 'other';
}

