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
  // Required vendor management fields
  payment_terms: string | null;
  notes: string | null;
  // Additional vendor management fields
  insurance_expiration?: string | null;
  tax_id?: string | null;
  rating?: number | null;
  hourly_rate?: number | null;
  contract_on_file?: boolean;
  preferred?: boolean;
  last_performance_review?: string | null;
}

export interface Specialty {
  id: string;
  specialty: string;
  description?: string | null;
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

// Filter subcontractors based on search query
export const filterSubcontractors = (
  subcontractors: Subcontractor[], 
  searchQuery: string
): Subcontractor[] => {
  if (!searchQuery) return subcontractors;
  
  const query = searchQuery.toLowerCase();
  return subcontractors.filter(sub => 
    (sub.subname?.toLowerCase() || '').includes(query) ||
    (sub.contactemail?.toLowerCase() || '').includes(query) ||
    (sub.phone?.toLowerCase() || '').includes(query) ||
    (sub.subid?.toLowerCase() || '').includes(query)
  );
};

// Get payment terms display label
export const getPaymentTermsLabel = (paymentTerms: string | null): string => {
  switch(paymentTerms) {
    case 'NET15':
      return 'Net 15 Days';
    case 'NET30':
      return 'Net 30 Days';
    case 'NET45':
      return 'Net 45 Days';
    case 'NET60':
      return 'Net 60 Days';
    case 'DUE_ON_RECEIPT':
      return 'Due On Receipt';
    default:
      return paymentTerms || 'Not Specified';
  }
};

// Get subcontractor rating display
export const getRatingDisplay = (rating: number | null): string => {
  if (rating === null) return 'Not Rated';
  
  const stars = '★'.repeat(Math.floor(rating));
  const remainder = rating % 1;
  const halfStar = remainder >= 0.5 ? '½' : '';
  
  return `${stars}${halfStar} (${rating})`;
};

// Calculate status based on performance metrics
export const calculateStatusFromPerformance = (
  onTimePercentage: number, 
  qualityRating: number
): string => {
  if (onTimePercentage > 90 && qualityRating >= 4.5) {
    return 'PREFERRED';
  } else if (onTimePercentage > 75 && qualityRating >= 3.5) {
    return 'QUALIFIED';
  } else if (onTimePercentage > 60 && qualityRating >= 2.5) {
    return 'ACTIVE';
  } else {
    return 'REVIEW_NEEDED';
  }
};
