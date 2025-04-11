
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { DocumentUploadFormValues, EntityType } from '../schemas/documentSchema';

interface UseFormInitializationProps {
  form: UseFormReturn<DocumentUploadFormValues>;
  entityType: EntityType;
  entityId?: string;
  isReceiptUpload: boolean;
  prefillData?: {
    amount?: number;
    vendorId?: string;
    materialName?: string;
    expenseName?: string;
    budgetItemId?: string;
    parentEntityType?: string;
    parentEntityId?: string;
    tags?: string[];
  };
}

export const useFormInitialization = ({
  form,
  entityType,
  entityId,
  isReceiptUpload,
  prefillData,
}: UseFormInitializationProps) => {
  // Initialize form values only once - memoized to prevent unnecessary re-renders
  const initializeForm = useCallback(() => {
    // Update these fields once to avoid re-rendering loops
    form.setValue('metadata.entityType', entityType);
    form.setValue('metadata.entityId', entityId || '');
    
    if (isReceiptUpload) {
      form.setValue('metadata.category', 'receipt');
      form.setValue('metadata.isExpense', true);
      form.setValue('metadata.expenseType', 'materials');
    }
    
    // Apply prefill data if available - optimized to only run once
    if (prefillData) {
      if (prefillData.amount) {
        form.setValue('metadata.amount', prefillData.amount);
      }
      
      if (prefillData.vendorId) {
        form.setValue('metadata.vendorId', prefillData.vendorId);
      }
      
      const itemName = prefillData.expenseName || prefillData.materialName;
      if (itemName) {
        form.setValue('metadata.tags', [itemName]);
        form.setValue('metadata.notes', `Receipt for: ${itemName}`);
      }
      
      if (prefillData.tags && prefillData.tags.length > 0) {
        form.setValue('metadata.tags', prefillData.tags);
      }
    }
  }, [entityId, entityType, form, isReceiptUpload, prefillData]);

  return {
    initializeForm,
  };
};

// Export the hook as the default export for backward compatibility
export default useFormInitialization;
