
import { BaseDocument } from '@/components/workOrders/details/DocumentsList/types';

export interface VendorDocument extends BaseDocument {
  // Additional fields for vendor document management
  description?: string;
  size?: number;
  uploaded_by?: string;
  amount?: number;
  expense_date?: string;
  is_expense?: boolean;
}
