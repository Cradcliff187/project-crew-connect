
import { BaseDocument } from '@/components/workOrders/details/DocumentsList/types';

export interface VendorDocument extends BaseDocument {
  entity_id?: string;
  entity_type?: string;
  updated_at?: string;
}

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
