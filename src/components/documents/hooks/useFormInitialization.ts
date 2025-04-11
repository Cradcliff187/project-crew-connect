
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EntityType, DocumentUploadFormValues } from '../schemas/documentSchema';

interface UseFormInitializationProps {
  form: UseFormReturn<DocumentUploadFormValues>;
  entityType: EntityType;
  entityId: string;
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

const useFormInitialization = ({ 
  form,
  entityType,
  entityId,
  isReceiptUpload = false,
  prefillData
}: UseFormInitializationProps) => {
  
  // Initialize the form with values from props and prefill data
  const initializeForm = useCallback(() => {
    // Reset the form with initial values
    form.reset({
      files: [],
      metadata: {
        entityType,
        entityId,
        isExpense: isReceiptUpload,
        category: isReceiptUpload ? 'receipt' : prefillData?.category,
        tags: prefillData?.tags || [],
        notes: prefillData?.notes || '',
        amount: prefillData?.amount,
        vendorId: prefillData?.vendorId,
        expenseDate: new Date(),
        budgetItemId: prefillData?.budgetItemId,
        parentEntityType: prefillData?.parentEntityType,
        parentEntityId: prefillData?.parentEntityId,
        version: 1
      }
    });
  }, [form, entityType, entityId, isReceiptUpload, prefillData]);

  return { initializeForm };
};

export default useFormInitialization;
