
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues, PrefillData } from '../schemas/documentSchema';

export interface DocumentFormProps {
  control: Control<DocumentUploadFormValues>;
}

export interface SubcontractorDocument {
  document_id: string;
  file_name: string;
  category: string | null;
  created_at: string;
  file_type: string | null;
  storage_path?: string;
  url?: string;
  is_expense?: boolean;
}
