
export interface EstimateItem {
  id: string;
  estimate_id: string;
  revision_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost?: number;
  markup_percentage?: number;
  markup_amount?: number;
  vendor_id?: string;
  subcontractor_id?: string;
  item_type?: string;
  document_id?: string;
  gross_margin?: number;
  gross_margin_percentage?: number;
  created_at?: string;
  updated_at?: string;
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
  created_at?: string;
  updated_at?: string;
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
  items?: EstimateItem[];
  revisions?: EstimateRevision[];
  currentRevision?: EstimateRevision;
}

export interface EstimateFormData {
  client: string;
  clientId?: string;
  project: string;
  description?: string;
  date: string;
  status: string;
  amount: number;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}
