
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
  amount?: number;
  expense_date?: string;
  version?: number;
  is_expense?: boolean;
  is_latest_version?: boolean;
  vendor_id?: string;
  vendor_type?: string;
  expense_type?: string;
  budget_item_id?: string;
  parent_entity_type?: string;
  parent_entity_id?: string;
  parent_document_id?: string;
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
