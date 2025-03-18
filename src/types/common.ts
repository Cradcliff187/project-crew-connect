
export type StatusType = 
  | 'active' 
  | 'inactive' 
  | 'pending' 
  | 'draft'
  | 'approved'
  | 'completed'
  | 'on_track'
  | 'in_progress'
  | 'warning'
  | 'critical'
  | 'not_set'
  | 'converted'
  | 'cancelled'
  | 'on-hold'
  | 'qualified'
  | 'unknown'
  | 'potential'
  | 'prospect'
  | 'sent'
  | 'rejected'
  | 'verified';

export interface Option {
  label: string;
  value: string;
}
