
import { StatusType } from '@/types/common';

// Define subcontractor type based on our database schema
export interface Subcontractor {
  subid: string;
  subname: string | null;
  contactemail: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  status: string | null;
  created_at: string | null;
  specialty_ids: string[] | null;
}

export interface Specialty {
  id: string;
  specialty: string;
}

// Map database status to StatusBadge component status
export const mapStatusToStatusBadge = (status: string | null): StatusType => {
  const statusMap: Record<string, StatusType> = {
    "ACTIVE": "active",
    "INACTIVE": "inactive",
    "QUALIFIED": "qualified",
    "PENDING": "pending",
    "REJECTED": "on-hold"
  };
  
  if (!status) return "unknown";
  
  return statusMap[status] || "unknown";
};

// Format date helper function
export const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(date);
};

// Filter subcontractors based on search query
export const filterSubcontractors = (subcontractors: Subcontractor[], searchQuery: string) => {
  return subcontractors.filter(sub => 
    (sub.subname?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (sub.contactemail?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (sub.subid?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );
};
