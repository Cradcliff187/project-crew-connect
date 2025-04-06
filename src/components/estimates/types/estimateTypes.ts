
export interface EstimateRevision {
  id: string;
  version: number;
  revision_date: string;
  amount?: number;
  notes?: string;
  status?: string;
  is_current?: boolean;
  pdf_document_id?: string;
  estimate_id: string;
  sent_date?: string;
  sent_to?: string;
  revision_by?: string;
}

export interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost?: number;
  markup_percentage?: number;
  markup_amount?: number;
  gross_margin?: number;
  gross_margin_percentage?: number;
  document_id?: string;
  revision_id?: string;
  estimate_id: string;
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
  currentRevision?: EstimateRevision;
}
