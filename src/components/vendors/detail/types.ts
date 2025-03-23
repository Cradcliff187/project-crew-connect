
// Update this file to use the VendorDocument from the main types
import { VendorDocument as WorkOrderVendorDocument } from '@/components/workOrders/details/DocumentsList/types';

// Re-export the type to maintain backwards compatibility
export type VendorDocument = WorkOrderVendorDocument;

export interface VendorProject {
  project_id: string;
  project_name: string;
  status: string;
  created_at: string;
}

export interface VendorWorkOrder {
  work_order_id: string;
  title: string;
  status: string;
  created_at: string;
  materials_cost: number;
}
