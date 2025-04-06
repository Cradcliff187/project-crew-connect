
export interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost?: number;
  markup_percentage?: number;
  markup_amount?: number;
  revision_id?: string;
  gross_margin?: number;
  gross_margin_percentage?: number;
  vendor_id?: string;
  subcontractor_id?: string;
  document_id?: string;
  item_type?: 'labor' | 'material' | 'subcontractor' | 'vendor' | 'other';
  trade_type?: string;
  expense_type?: string;
  custom_type?: string;
}

export interface EstimateRevision {
  id: string;
  estimate_id: string;
  version: number;
  revision_date: string;
  amount?: number;
  notes?: string;
  is_current: boolean;
  pdf_document_id?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  sent_date?: string;
  sent_to?: string;
}

export interface Estimate {
  estimateid: string;
  customerid?: string;
  customername?: string;
  projectid?: string;
  projectname?: string;
  job_description?: string;
  estimateamount: number;
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
  items: EstimateItem[];
  currentRevision?: EstimateRevision;
}
