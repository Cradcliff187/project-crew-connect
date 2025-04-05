
export interface VendorDetail {
  vendorid: string;
  vendorname: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  status?: string;
  payment_terms?: string;
  tax_id?: string;
  notes?: string;
  created_at?: string;
  qbvendortype?: string;
}

export interface VendorDocument {
  document_id: string;
  file_name: string;
  file_type?: string;
  category?: string;
  created_at: string;
  url: string;
  file_size?: number;
  entity_id?: string;
  entity_type?: string;
  storage_path?: string;
  updated_at?: string;
}

export interface VendorProject {
  projectid: string;
  projectname: string;
  status: string;
  createdon?: string;
  total_budget?: number;
}

export interface VendorWorkOrder {
  work_order_id: string;
  title: string;
  status: string;
  created_at: string;
  progress?: number;
  materials_cost?: number;
}

export interface VendorExpense {
  id: string;
  description: string;
  amount: number;
  expense_date: string;
  expense_type: string;
  entity_type: string;
  entity_id: string;
}
