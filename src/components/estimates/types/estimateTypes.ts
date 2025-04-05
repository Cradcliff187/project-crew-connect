
export interface EstimateItem {
  id: string;
  estimate_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost?: number;
  markup_percentage?: number;
  markup_amount?: number;
  gross_margin?: number;
  gross_margin_percentage?: number;
  vendor_id?: string;
  subcontractor_id?: string;
  item_type?: string;
  document_id?: string;
  notes?: string;
  revision_id?: string;
  original_item_id?: string;
}

export interface EstimateRevision {
  id: string;
  estimate_id: string;
  version: number;
  revision_date: string;
  sent_date?: string;
  notes?: string;
  status: string;
  is_current: boolean;
  amount?: number;
  revision_by?: string;
  document_id?: string;
  pdf_document_id?: string;
  created_at?: string;
  updated_at?: string;
  sent_to?: string;
}

export interface Estimate {
  id: string;
  customerid?: string;
  customername?: string;
  customer?: string;
  client?: string;
  customerId?: string; // Added to match other interfaces
  projectid?: string;
  projectname?: string;
  project?: string;
  description?: string;
  job_description?: string;
  estimateamount: number;
  total?: number;
  amount?: number;
  contingencyamount?: number;
  contingency_percentage?: number;
  datecreated?: string;
  sentdate?: string;
  approveddate?: string;
  status: string;
  sitelocationaddress?: string;
  sitelocationcity?: string;
  sitelocationstate?: string;
  sitelocationzip?: string;
  items?: EstimateItem[];
  versions?: number;
  current_revision?: EstimateRevision;
  revisions?: EstimateRevision[];
  date?: string; // Added to ensure consistency with UI expectations
}
