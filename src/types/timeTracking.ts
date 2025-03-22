
export interface TimeEntry {
  id: string;
  entity_type: 'work_order' | 'project';
  entity_id: string;
  entity_name?: string;
  date_worked: string;
  start_time: string;
  end_time: string;
  hours_worked: number;
  employee_id: string | null;
  employee_name: string | null;
  employee_rate: number | null;
  notes: string | null;
  has_receipts: boolean;
  receipt_amount: number | null;
  vendor_id: string | null;
  vendor_name: string | null;
  total_cost: number;
  created_at: string;
  updated_at: string;
}

export interface ReceiptMetadata {
  vendorId?: string;
  amount?: number;
  materialName?: string;
}

export interface TimeFormEmployee {
  employee_id: string;
  name: string;
  hourly_rate?: number;
}

export interface TimeLog {
  id: string;
  work_order_id: string;
  employee_id: string | null;
  hours_worked: number;
  notes: string | null;
  work_date: string;
  created_at: string;
}

export interface EntitySelectorConfirmProps {
  control: any;
  entityType: string;
  entityId?: string;
  fieldName: string;
  label: string;
  required?: boolean;
  prefillEntityId?: string;
}
