// Define subcontractor form data type
export interface SubcontractorFormData {
  subid?: string;
  company_name: string;
  contact_name?: string;
  contactemail: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  status: string;
  specialty_ids: string[];
  payment_terms?: string;
  notes?: string;
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

export interface FormSectionProps {
  control: any;
  isEditing?: boolean;
}

export const paymentTermsOptions = [
  { value: 'NET15', label: 'Net 15 Days' },
  { value: 'NET30', label: 'Net 30 Days' },
  { value: 'NET45', label: 'Net 45 Days' },
  { value: 'NET60', label: 'Net 60 Days' },
  { value: 'DUE_ON_RECEIPT', label: 'Due On Receipt' },
];
