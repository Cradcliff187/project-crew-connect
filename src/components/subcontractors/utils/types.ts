import { Database } from '@/integrations/supabase/types';

// Define the Subcontractor type based on the database schema (public.subcontractors)
export type Subcontractor = Database['public']['Tables']['subcontractors']['Row'];

// If you need a more specific or augmented type for UI purposes, you can define it here
// For example, if you always want contact_name to be a string, or add calculated fields.
// However, directly using the Supabase generated type is often a good practice for Row data.

// The following specific interface might now be redundant if the above Row type is sufficient
// and already reflects company_name and contact_name from the DB schema updates.
// I will comment it out, assuming the DB Row type is the source of truth.
/*
export interface Subcontractor {
  subid: string; // Now UUID
  company_name: string | null; // Replaces subname
  contact_name?: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  contactemail: string | null;
  phone: string | null; // This was renamed to phone_number in DB
  phone_number?: string | null; // Add if needed, or ensure Row type has it
  status: string | null;
  specialty_ids?: string[];
  payment_terms?: string;
  notes?: string;
  insurance_expiration?: string | null;
  insurance_provider?: string | null;
  insurance_policy_number?: string | null;
  tax_id?: string | null;
  hourly_rate?: number | null;
  contract_on_file?: boolean;
  contract_expiration?: string | null;
  preferred?: boolean;
  rating?: number | null;
  on_time_percentage?: number | null;
  quality_score?: number | null;
  safety_incidents?: number | null;
  response_time_hours?: number | null;
  created_at?: string;
  updated_at?: string;
}
*/

// Consider if other types here need updates related to subid (UUID) or subname->company_name

export interface Specialty {
  id: string;
  specialty: string;
  description?: string | null;
}
