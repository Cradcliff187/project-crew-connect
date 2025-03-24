
import { Subcontractor } from './types';

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
    (sub.city && sub.state && (`${sub.city}, ${sub.state}`).toLowerCase().includes(query))
  );
};
