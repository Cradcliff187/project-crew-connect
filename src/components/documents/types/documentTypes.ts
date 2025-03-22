
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues, PrefillData } from '../schemas/documentSchema';

export interface DocumentFormProps {
  control: Control<DocumentUploadFormValues>;
}

export interface DocumentFilterFormValues {
  searchTerm?: string;
  category?: string;
  isExpense?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface DocumentFiltersProps {
  onFilterChange: (filters: DocumentFilterFormValues) => void;
  initialFilters?: Partial<DocumentFilterFormValues>;
}

// Standardized document interface to be used across the application
export interface DocumentBase {
  document_id: string;
  file_name: string;
  category: string | null;
  created_at: string;
  file_type: string | null;
  storage_path?: string;
  url?: string;
  is_expense?: boolean;
  vendor_id?: string;
  subcontractor_id?: string;
}

// Export the PrefillData interface to fix the import error
export type { PrefillData } from '../schemas/documentSchema';
