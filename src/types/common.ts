
/**
 * Common types used throughout the application
 */

export type StatusType = 'NEW' | 'DRAFT' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED' | 'APPROVED' | 'REJECTED' | 'SENT' | 'READY' | 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'CONVERTED' | 'draft' | 'sent' | 'approved' | 'rejected' | 'converted';

export interface StatusOption {
  value: string;
  label: string;
  color: string;
  description?: string;
}

export interface EntityWithStatus {
  id: string;
  status: StatusType;
  [key: string]: any;
}

export interface DataTableProps<TData> {
  data: TData[];
  columns: any[];
  searchQuery?: string;
  searchFields?: string[];
  loading?: boolean;
  error?: string | null;
}
