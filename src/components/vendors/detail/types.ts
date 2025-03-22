
import { DocumentBase } from '@/components/documents/types/documentTypes';

export type VendorDocument = DocumentBase;

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
