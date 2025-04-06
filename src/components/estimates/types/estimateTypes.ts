
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
  estimate_id?: string;
  revision_id?: string;
  original_item_id?: string;
  created_at?: string;
  updated_at?: string;
  item_type?: string;
  trade_type?: string;
  expense_type?: string;
  custom_type?: string;
  vendor_id?: string;
  subcontractor_id?: string;
  document_id?: string;
}

export interface EstimateRevision {
  id: string;
  estimate_id: string;
  version: number;
  revision_date: string;
  amount?: number;
  status?: string;
  is_current?: boolean;
  notes?: string;
  pdf_document_id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  contingency_percentage?: number;
  contingency_amount?: number;
  total_cost?: number;
  total_markup?: number;
  gross_margin?: number;
  margin_percentage?: number;
  reason_for_change?: string;
  client_feedback?: string;
  internal_notes?: string;
}

export interface EstimateRevisionComparison {
  currentRevision: EstimateRevision;
  compareRevision: EstimateRevision;
  addedItems: EstimateItem[];
  removedItems: EstimateItem[];
  changedItems: {
    current: EstimateItem;
    previous: EstimateItem;
    priceDifference: number;
    percentageDifference: number;
    changes: {
      field: string;
      previousValue: any;
      currentValue: any;
    }[];
  }[];
  totalDifference: number;
  percentageChange: number;
  summary: {
    totalItemsChanged: number;
    newItemsCost: number;
    removedItemsCost: number;
    modifiedItemsDifference: number;
  };
}

export interface EstimateFinancialSummary {
  subtotal: number;
  totalCost?: number;
  totalMarkup?: number;
  grossMargin?: number;
  grossMarginPercentage?: number;
  contingencyPercentage?: number;
  contingencyAmount?: number;
  grandTotal: number;
}

export interface EstimateVersionMetrics {
  revision: EstimateRevision;
  itemCount: number;
  financials: EstimateFinancialSummary;
  changeFromPrevious?: {
    amount: number;
    percentage: number;
  };
}

export interface RevisionComparisonField {
  label: string;
  field: keyof EstimateItem;
  formatter?: (value: any) => string;
  showDifference?: boolean;
}

