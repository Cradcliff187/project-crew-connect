
import { Document } from '@/components/documents/schemas/documentSchema';

export interface SubcontractorDocument extends Document {
  // Additional properties for subcontractor documents if needed
}

export interface SubcontractorTimeLog {
  timelog_id: string;
  work_order_id: string;
  work_order_title: string;
  date: string;
  hours: number;
  rate: number;
  total: number;
}

export interface SubcontractorExpense {
  expense_id: string;
  work_order_id: string;
  work_order_title: string;
  expense_name: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
}

export interface SubcontractorMaterial {
  material_id: string;
  work_order_id: string;
  work_order_title: string;
  material_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  date_added: string;
}
