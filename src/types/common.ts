
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
  | 'on_hold'
  | 'qualified'
  | 'unknown'
  | 'potential'
  | 'prospect'
  | 'sent'
  | 'rejected'
  | 'verified'
  | 'new'
  | 'not_started'
  | 'not-started'
  // Added new status types to match SubcontractorStatusBadge usage
  | 'success'
  | 'info'
  | 'error'
  | 'neutral'
  | 'purple';

export interface Option {
  label: string;
  value: string;
}
