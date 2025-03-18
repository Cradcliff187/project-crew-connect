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
  | 'cancelled';

export interface Option {
  label: string;
  value: string;
}
