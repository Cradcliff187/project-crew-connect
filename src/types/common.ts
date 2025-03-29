
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
  | 'in-progress'
  // Work order status types (uppercase for consistency with the database)
  | 'NEW'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED'
  // Vendor status types
  | 'POTENTIAL'
  | 'APPROVED'
  | 'ACTIVE'
  | 'INACTIVE'
  // UI status types for badges
  | 'success'
  | 'info'
  | 'error'
  | 'neutral'
  | 'purple';

export interface Option {
  label: string;
  value: string;
}
