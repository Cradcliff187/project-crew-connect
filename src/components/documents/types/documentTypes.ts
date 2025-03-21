
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues, DocumentCategory } from '../schemas/documentSchema';

export interface DocumentFormProps {
  control: Control<DocumentUploadFormValues>;
}

export interface PrefillData {
  amount?: number;
  vendorId?: string;
  materialName?: string;
  category?: DocumentCategory;  // Added this property
}
