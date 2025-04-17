
import { Control } from 'react-hook-form';
import { DocumentCategory, EntityType } from '@/types/common';

export interface DocumentFormProps {
  control: Control<any>;
}

export interface Document {
  id: string;
  document_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url?: string;
  url?: string;
  storage_path: string;
  entity_type: EntityType;
  entity_id: string;
  uploaded_by: string;
  created_at: string;
  description?: string;
  category?: DocumentCategory;
  tags?: string[];
  notes?: string;
}

export interface PrefillData {
  amount?: number;
  vendorId?: string;
  vendorName?: string;
  materialName?: string;
  expenseName?: string;
  notes?: string;
  category?: string;
  tags?: string[];
  budgetItemId?: string;
  parentEntityType?: string;
  parentEntityId?: string;
  expenseType?: string;
  expenseDate?: Date | string;
  isExpense?: boolean;
  subcontractorId?: string;
  is_expense?: boolean;
}
