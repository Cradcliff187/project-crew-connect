
export type EstimateItem = {
  id: string;
  estimate_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type EstimateRevision = {
  id: string;
  estimate_id: string;
  version: number;
  revision_date: string;
  revision_by: string | null;
  notes: string | null;
  amount: number | null;
};
