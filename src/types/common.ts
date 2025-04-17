
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email?: string;
  role?: string;
  hourlyRate?: number;
  status?: string;
}

export type EntityType = 
  | 'PROJECT'
  | 'ESTIMATE'
  | 'WORK_ORDER'
  | 'VENDOR'
  | 'SUBCONTRACTOR'
  | 'TIME_ENTRY'
  | 'EMPLOYEE'
  | 'CONTACT';

export type DocumentCategory = 
  | 'other'
  | 'invoice'
  | 'receipt'
  | '3rd_party_estimate'
  | 'contract'
  | 'insurance'
  | 'certification'
  | 'photo';
