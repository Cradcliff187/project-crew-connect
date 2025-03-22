
import { DocumentBase } from '@/components/documents/types/documentTypes';

export interface SubcontractorDocument extends DocumentBase {}

export interface Subcontractor {
  subid: string;
  subname: string;
  contactemail: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  status: string | null;
  specialty_ids: string[]; 
  created_at: string;
  payment_terms: string | null;
  notes: string | null;
  insurance_expiration?: string | null;
  insurance_provider?: string | null;
  insurance_policy_number?: string | null;
  tax_id?: string | null;
  hourly_rate?: number | null;
  contract_on_file?: boolean;
  contract_expiration?: string | null;
  preferred?: boolean;
}
