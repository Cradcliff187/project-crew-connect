import { Database } from '@/integrations/supabase/types';

// Existing types
export interface Subcontractor {
  subid: string;
  subname: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  contactemail: string | null;
  phone: string | null;
  status: string | null;
  // Add other relevant fields as needed
}

export interface Specialty {
  id: string;
  specialty: string;
  // Add other relevant fields as needed
}

// Keep SubcontractorDocument defined based on generated type for now,
// but it should probably be replaced by direct usage of the DocumentRow type.
export type SubcontractorDocument = Database['public']['Tables']['documents']['Row'];
