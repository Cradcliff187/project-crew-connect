
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
  };
  isFormInitialized: boolean;
  setIsFormInitialized: React.Dispatch<React.SetStateAction<boolean>>;
  previewURL: string | null;
  onCancel?: () => void;
}

export const useFormInitialization = ({
  form,
  entityType,
  entityId,
  isReceiptUpload,
  prefillData,
  isFormInitialized,
  setIsFormInitialized,
  previewURL,
  onCancel
}: UseFormInitializationProps) => {
  // Initialize form values only once - memoized to prevent unnecessary re-renders
  const initializeForm = useCallback(() => {
    if (isFormInitialized) return;

    // Only update these fields once to avoid re-rendering loops
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
    }
    
    setIsFormInitialized(true);
  }, [entityId, entityType, form, isFormInitialized, isReceiptUpload, prefillData, setIsFormInitialized]);

  // Create stable cancel handler
  const handleCancel = useCallback(() => {
    // Clean up before cancelling
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
    }
    
    // Reset form
    form.reset();
    
    // Call parent cancel handler
    if (onCancel) {
      onCancel();
    }
  }, [form, onCancel, previewURL]);

  return {
    initializeForm,
    handleCancel
  };
};
