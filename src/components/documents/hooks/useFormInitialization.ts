
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { DocumentUploadFormValues, EntityType } from '../schemas/documentSchema';

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
  };
  isFormInitialized: boolean;
  setIsFormInitialized: (initialized: boolean) => void;
  previewURL: string | null;
  onCancel?: () => void;
  allowEntityTypeSelection?: boolean;
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
  onCancel,
  allowEntityTypeSelection
}: UseFormInitializationProps) => {
  // Initialize the form
  const initializeForm = useCallback(() => {
    if (!isFormInitialized) {
      // Only set entityType if not allowing selection or if it's provided
      if (entityType && (!allowEntityTypeSelection || isReceiptUpload)) {
        form.setValue('metadata.entityType', entityType);
      }
      
      if (entityId) {
        form.setValue('metadata.entityId', entityId);
      }
      
      if (isReceiptUpload) {
        form.setValue('metadata.category', 'receipt');
        form.setValue('metadata.isExpense', true);
        form.setValue('metadata.expenseType', 'materials');
        if (prefillData?.vendorId) {
          form.setValue('metadata.vendorId', prefillData.vendorId);
        }
        if (prefillData?.amount) {
          form.setValue('metadata.amount', prefillData.amount);
        }
        form.setValue('metadata.tags', ['receipt']);
      }
      
      setIsFormInitialized(true);
    }
  }, [
    form,
    entityType,
    entityId,
    isReceiptUpload,
    prefillData,
    isFormInitialized,
    setIsFormInitialized,
    allowEntityTypeSelection
  ]);
  
  // Handle form cancellation
  const handleCancel = useCallback(() => {
    // Clean up the preview URL
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
    }
    
    // Reset the form
    form.reset();
    
    // Call the onCancel callback if it exists
    if (onCancel) {
      onCancel();
    }
  }, [form, onCancel, previewURL]);
  
  return {
    initializeForm,
    handleCancel
  };
};
