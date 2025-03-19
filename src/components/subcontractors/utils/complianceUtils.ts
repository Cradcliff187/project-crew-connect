
import { Subcontractor } from './types';

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
