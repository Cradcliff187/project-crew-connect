
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
    category?: string;
    tags?: string[];
    notes?: string;
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
      console.log('Initializing document upload form with:', {
        entityType,
        entityId,
        isReceiptUpload,
        prefillData,
        allowEntityTypeSelection
      });
      
      // Only set entityType if not allowing selection or if it's provided
      if (entityType && (!allowEntityTypeSelection || isReceiptUpload)) {
        form.setValue('metadata.entityType', entityType);
      }
      
      if (entityId) {
        form.setValue('metadata.entityId', entityId);
      }
      
      // Set default category based on context or prefill data
      if (prefillData?.category) {
        form.setValue('metadata.category', prefillData.category);
      } else if (isReceiptUpload) {
        form.setValue('metadata.category', 'receipt');
      }
      
      // Set expense-related fields if this is a receipt upload
      if (isReceiptUpload) {
        form.setValue('metadata.isExpense', true);
        form.setValue('metadata.expenseType', 'materials');
        
        // Prefill default tags for receipts
        const defaultTags = ['receipt'];
        if (entityType === 'WORK_ORDER') {
          defaultTags.push('work_order_expense');
        } else if (entityType === 'PROJECT') {
          defaultTags.push('project_expense');
        }
        form.setValue('metadata.tags', defaultTags);
      }
      
      // Apply prefill data when available
      if (prefillData) {
        if (prefillData.vendorId) {
          form.setValue('metadata.vendorId', prefillData.vendorId);
        }
        
        if (prefillData.amount) {
          form.setValue('metadata.amount', prefillData.amount);
        }
        
        if (prefillData.notes) {
          form.setValue('metadata.notes', prefillData.notes);
        } else if (prefillData.materialName || prefillData.expenseName) {
          const itemName = prefillData.materialName || prefillData.expenseName;
          form.setValue('metadata.notes', `Receipt for: ${itemName}`);
        }
        
        if (prefillData.tags && prefillData.tags.length > 0) {
          form.setValue('metadata.tags', prefillData.tags);
        }
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
