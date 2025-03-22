
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

export interface DocumentFormProps {
  control: Control<DocumentUploadFormValues>;
}

export interface PrefillData {
  amount?: number;
  vendorId?: string;
  materialName?: string;
}
