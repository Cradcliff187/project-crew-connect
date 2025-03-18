
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
  insurance_provider?: string | null;
  insurance_policy_number?: string | null;
  tax_id?: string | null;
  rating?: number | null;
  hourly_rate?: number | null;
  contract_on_file?: boolean;
  contract_expiration?: string | null;
  preferred?: boolean;
  last_performance_review?: string | null;
  // Performance metrics
  on_time_percentage?: number | null;
  quality_score?: number | null;
  safety_incidents?: number | null;
  response_time_hours?: number | null;
  total_completed_amount?: number | null;
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

// Calculates days until insurance expiration
export const getDaysUntilInsuranceExpiration = (expirationDate: string | null): number | null => {
  if (!expirationDate) return null;
  
  const expiration = new Date(expirationDate);
  const today = new Date();
  
  // Reset time components for accurate day calculation
  expiration.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = expiration.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Get insurance status badge info
export const getInsuranceStatusInfo = (expirationDate: string | null): { status: string; color: string; urgency: 'critical' | 'warning' | 'valid' | 'unknown' } => {
  if (!expirationDate) {
    return { 
      status: 'Not Available', 
      color: 'text-gray-500',
      urgency: 'unknown'
    };
  }
  
  const daysRemaining = getDaysUntilInsuranceExpiration(expirationDate);
  
  if (daysRemaining === null) {
    return { 
      status: 'Unknown', 
      color: 'text-gray-500',
      urgency: 'unknown'
    };
  } else if (daysRemaining < 0) {
    return { 
      status: 'Expired', 
      color: 'text-red-500',
      urgency: 'critical'
    };
  } else if (daysRemaining <= 30) {
    return { 
      status: `Expiring Soon (${daysRemaining} days)`, 
      color: 'text-amber-500',
      urgency: 'warning'
    };
  } else {
    return { 
      status: `Valid (${daysRemaining} days)`, 
      color: 'text-green-500',
      urgency: 'valid'
    };
  }
};

// Get the class names for performance indicators
export const getPerformanceIndicatorClass = (value: number | null, thresholds: { good: number, average: number }): string => {
  if (value === null) return 'text-gray-400';
  
  if (value >= thresholds.good) {
    return 'text-green-500';
  } else if (value >= thresholds.average) {
    return 'text-amber-500';
  } else {
    return 'text-red-500';
  }
};

// Calculate the overall vendor score (0-100)
export const calculateVendorScore = (subcontractor: Subcontractor): number | null => {
  // If essential metrics are missing, return null
  if (!subcontractor.rating && !subcontractor.on_time_percentage) {
    return null;
  }
  
  let totalScore = 0;
  let weightSum = 0;
  
  // Quality Rating (scale 0-5) - 40% weight
  if (subcontractor.rating !== null && subcontractor.rating !== undefined) {
    totalScore += (subcontractor.rating / 5) * 100 * 0.4;
    weightSum += 0.4;
  }
  
  // On-time percentage - 30% weight
  if (subcontractor.on_time_percentage !== null && subcontractor.on_time_percentage !== undefined) {
    totalScore += subcontractor.on_time_percentage * 0.3;
    weightSum += 0.3;
  }
  
  // Response time (inversely proportional) - 15% weight
  if (subcontractor.response_time_hours !== null && subcontractor.response_time_hours !== undefined) {
    // Convert response time to a 0-100 scale (assuming 48 hours is 0%, 1 hour is 100%)
    const responseScore = Math.max(0, Math.min(100, 100 - ((subcontractor.response_time_hours - 1) / 47 * 100)));
    totalScore += responseScore * 0.15;
    weightSum += 0.15;
  }
  
  // Safety (inversely proportional to incidents) - 15% weight
  if (subcontractor.safety_incidents !== null && subcontractor.safety_incidents !== undefined) {
    // Convert safety incidents to a 0-100 scale (0 incidents is 100%, 5+ incidents is 0%)
    const safetyScore = Math.max(0, 100 - (subcontractor.safety_incidents * 20));
    totalScore += safetyScore * 0.15;
    weightSum += 0.15;
  }
  
  // If we don't have enough data, return null
  if (weightSum < 0.5) {
    return null;
  }
  
  // Normalize the score based on available metrics
  return Math.round(totalScore / weightSum);
};

// Format currency with dollar sign
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(amount);
};

// Format a date or return 'N/A' if null
export const formatDate = (date: string | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(new Date(date));
  } catch (error) {
    return 'Invalid date';
  }
};
