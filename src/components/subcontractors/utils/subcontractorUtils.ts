
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
  // Enhanced vendor management fields
  payment_terms: string | null;
  insurance_required: boolean | null;
  insurance_expiry: string | null;
  notes: string | null;
}

export const formatSubcontractorAddress = (subcontractor: Subcontractor): string => {
  const addressParts = [];
  if (subcontractor.address) addressParts.push(subcontractor.address);
  
  let cityStateZip = '';
  if (subcontractor.city) cityStateZip += subcontractor.city;
  if (subcontractor.state) {
    if (cityStateZip) cityStateZip += ', ';
    cityStateZip += subcontractor.state;
  }
  if (subcontractor.zip) {
    if (cityStateZip) cityStateZip += ' ';
    cityStateZip += subcontractor.zip;
  }
  
  if (cityStateZip) addressParts.push(cityStateZip);
  
  return addressParts.join('\n');
};
