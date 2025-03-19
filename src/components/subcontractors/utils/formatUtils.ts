
import { Subcontractor } from './types';

// Format a date string to a readable format
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Not set';
  
  try {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(new Date(dateString));
  } catch (error) {
    return 'Invalid date';
  }
};

// Format a subcontractor's address
export const formatSubcontractorAddress = (subcontractor: Subcontractor): string => {
  const parts = [];
  
  if (subcontractor.address) parts.push(subcontractor.address);
  
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
  
  if (cityStateZip) parts.push(cityStateZip);
  
  return parts.length > 0 ? parts.join('\n') : 'No address provided';
};
