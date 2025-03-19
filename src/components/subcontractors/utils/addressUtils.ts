
import { Subcontractor } from './types';

/**
 * Formats a subcontractor's address into a displayable string
 */
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

/**
 * Filter subcontractors based on search query
 */
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
