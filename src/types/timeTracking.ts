
import { EntityType } from './common';

export interface TimeEntry {
  id: string;
  entity_type: 'work_order' | 'project';
  entity_id: string;
  employee_id: string;
  employee_name?: string;
  date_worked: string;
  start_time: string;
  end_time: string;
  hours_worked: number;
  notes: string;
  has_receipts: boolean;
  created_at: string;
  updated_at?: string;
  total_cost?: number;
  employee_rate?: number;
  employees?: {
    first_name: string;
    last_name: string;
    hourly_rate: number;
  };
}

export interface TimeEntryFormData {
  entityType: EntityType;
  entityId: string;
  entityName?: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
  hasReceipt: boolean;
}

export interface TimeEntryFilter {
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  entityType?: EntityType;
  entityId?: string;
}
