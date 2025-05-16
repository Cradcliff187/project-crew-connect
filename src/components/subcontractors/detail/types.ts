import { Database } from '@/integrations/supabase/types';

// Use the generated Row type for Subcontractor
export type Subcontractor = Database['public']['Tables']['subcontractors']['Row'];

/* Commenting out the manual interface as it's now redundant
export interface Subcontractor {
  subid: string; // This is now UUID string
  company_name: string | null; // Was subname
  contact_name?: string | null; // Add if not present
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  contactemail: string | null;
  phone: string | null; // This was phone_number
  phone_number?: string | null; // Corrected
  status: string | null;
  // Add other relevant fields as needed
}
*/

export interface Specialty {
  id: string;
  specialty: string;
  // Add other relevant fields as needed
}

// Keep SubcontractorDocument defined based on generated type for now,
// but it should probably be replaced by direct usage of the DocumentRow type.
export type SubcontractorDocument = Database['public']['Tables']['documents']['Row'];
