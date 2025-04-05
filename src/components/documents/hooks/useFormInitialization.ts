
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { DocumentUploadFormValues, EntityType } from '../schemas/documentSchema';
import { toDocumentCategory, isValidDocumentCategory } from '../utils/DocumentCategoryHelper';

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
  };
}

export const useFormInitialization = ({
  form,
  entityType = 'PROJECT',
  entityId,
  isReceiptUpload = false,
  prefillData
}: UseFormInitializationProps) => {
  const initializeForm = useCallback(() => {
    const defaultCategory = isReceiptUpload ? 'receipt' : (prefillData?.category && isValidDocumentCategory(prefillData.category) ? 
      toDocumentCategory(prefillData.category) : 'other');
      
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
      }
    });
  }, [form, entityType, entityId, isReceiptUpload, prefillData]);

  return {
    initializeForm
  };
};

export default useFormInitialization;
