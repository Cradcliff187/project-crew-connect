
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
  specialty_ids: string[]; // Make sure this is string[] to match our converted data
  created_at: string;
  // Required vendor management fields
  payment_terms: string | null;
  notes: string | null;
  // Additional vendor management fields
  insurance_expiration?: string | null;
  insurance_provider?: string | null;
  insurance_policy_number?: string | null;
  tax_id?: string | null;
  hourly_rate?: number | null;
  contract_on_file?: boolean;
  contract_expiration?: string | null;
  preferred?: boolean;
}

export interface Specialty {
  id: string;
  specialty: string;
  description?: string | null;
}
