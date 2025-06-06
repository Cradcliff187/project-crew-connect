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
  item_type?: string; // Changed from enum to string to match database values
  trade_type?: string;
  expense_type?: string;
  custom_type?: string;
  original_item_id?: string;
  estimate_id?: string;
  created_at?: string;
  updated_at?: string;
  item_category?: string;
  notes?: string;
}

export interface EstimateRevision {
  id: string;
  estimate_id: string;
  version: number;
  revision_date: string;
  amount?: number;
  notes?: string;
  is_selected_for_view: boolean;
  pdf_document_id?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  sent_date?: string;
  sent_to?: string;
  revision_by?: string; // Added this field
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

// --- Types for Revision Comparison ---
export interface ItemChange {
  field: keyof EstimateItem | string;
  previousValue: any;
  currentValue: any;
}

export interface ChangedItemDetail {
  current: EstimateItem;
  previous: EstimateItem;
  changes: ItemChange[];
  priceDifference: number;
  percentageDifference: number;
}

export interface RevisionComparisonResult {
  revisionA: EstimateRevision;
  revisionB: EstimateRevision;
  addedItems: EstimateItem[];
  removedItems: EstimateItem[];
  changedItems: ChangedItemDetail[];
  summary: {
    totalItemsAdded: number;
    totalItemsRemoved: number;
    totalItemsChanged: number;
    netAmountChange: number;
    netItemsPriceChange: number;
  };
}

export interface RevisionComparisonField {
  label: string;
  field: keyof EstimateItem;
  formatter?: (value: any) => string;
  showDifference?: boolean;
}

export interface EstimateRevisionComparison {
  currentRevision: EstimateRevision;
  compareRevision: EstimateRevision;
  addedItems: EstimateItem[];
  removedItems: EstimateItem[];
  changedItems: any[];
  totalDifference: number;
  percentageChange: number;
  summary: {
    totalItemsChanged: number;
    newItemsCost: number;
    removedItemsCost: number;
    modifiedItemsDifference: number;
  };
}
