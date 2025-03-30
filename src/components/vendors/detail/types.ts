
import { BaseDocument } from '@/components/workOrders/details/DocumentsList/types';
import { StatusType } from '@/types/common';

export interface VendorDocument extends BaseDocument {
  // Additional fields for vendor document management
  description?: string;
  size?: number;
  uploaded_by?: string;
  amount?: number;
  expense_date?: string;
  is_expense?: boolean;
}

// Define VendorProject type based on the return structure of get_vendor_projects function
export interface VendorProject {
  project_id: string;
  project_name: string;
  status: string;
  created_at: string;
}

// Define VendorWorkOrder type based on the return structure of get_vendor_work_orders function
export interface VendorWorkOrder {
  work_order_id: string;
  title: string;
  status: string;
  materials_cost?: number;
  created_at: string;
}
