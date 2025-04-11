
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { DocumentUploadFormValues, EntityType, DocumentCategory } from '../schemas/documentSchema';
import { isValidDocumentCategory, toDocumentCategory } from '../utils/DocumentCategoryHelper';

interface UseFormInitializationProps {
  form: UseFormReturn<DocumentUploadFormValues>;
  entityType?: EntityType;
  entityId?: string;
  isReceiptUpload?: boolean;
  prefillData?: {
    amount?: number;
    vendorId?: string;
    materialName?: string;
    expenseName?: string;
    notes?: string;
    category?: string;
    tags?: string[];
    budgetItemId?: string;
    parentEntityType?: EntityType;
    parentEntityId?: string;
  };
}

export const useFormInitialization = ({
  form,
  entityType = EntityType.PROJECT,
  entityId,
  isReceiptUpload = false,
  prefillData
}: UseFormInitializationProps) => {
  const initializeForm = useCallback(() => {
    const defaultCategory = isReceiptUpload ? 'receipt' : (prefillData?.category && isValidDocumentCategory(prefillData.category) ? 
      toDocumentCategory(prefillData.category) : DocumentCategory.OTHER);
      
    form.reset({
      files: [],
      metadata: {
        category: defaultCategory,
        entityType: entityType,
        entityId: entityId || '',
        amount: prefillData?.amount,
        expenseDate: new Date(),
        version: 1,
        tags: prefillData?.tags || [],
        notes: prefillData?.notes || '',
        isExpense: isReceiptUpload || defaultCategory === 'receipt' || defaultCategory === 'invoice',
        vendorId: prefillData?.vendorId,
        budgetItemId: prefillData?.budgetItemId,
        parentEntityType: prefillData?.parentEntityType,
        parentEntityId: prefillData?.parentEntityId
      }
    });
  }, [form, entityType, entityId, isReceiptUpload, prefillData]);

  return {
    initializeForm
  };
};

export default useFormInitialization;
