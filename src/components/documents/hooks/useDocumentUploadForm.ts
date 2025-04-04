
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  DocumentUploadFormValues, 
  documentUploadSchema, 
  EntityType
} from '../schemas/documentSchema';
import { useFileSelectionHandling } from './useFileSelectionHandling';
import { useFormSubmitHandler } from './useFormSubmitHandler';
import { useFormValueWatchers } from './useFormValueWatchers';
import { useFormInitialization } from './useFormInitialization';

interface UseDocumentUploadFormProps {
  entityType?: EntityType;
  entityId?: string;
  onSuccess?: (documentId?: string) => void;
  onCancel?: () => void;
  isReceiptUpload?: boolean;
  prefillData?: {
    amount?: number;
    vendorId?: string;
    materialName?: string;
    expenseName?: string;
  };
  allowEntityTypeSelection?: boolean;
}

export const useDocumentUploadForm = ({
  entityType,
  entityId,
  onSuccess,
  onCancel,
  isReceiptUpload = false,
  prefillData,
  allowEntityTypeSelection = false
}: UseDocumentUploadFormProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [showVendorSelector, setShowVendorSelector] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  
  // Create form with default values, using PROJECT as default if not provided
  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      files: [] as File[],
      metadata: {
        category: (isReceiptUpload ? 'receipt' : 'other'),
        entityType: entityType || 'PROJECT',
        entityId: entityId || '',
        version: 1,
        tags: [] as string[],
        isExpense: isReceiptUpload ? true : false,
        vendorId: '',
        vendorType: 'vendor',
        expenseType: 'materials',
      }
    },
    mode: 'onChange'
  });

  // Use our custom hooks to handle different aspects of the form
  const { handleFileSelect } = useFileSelectionHandling(form, setPreviewURL);
  const { onSubmit } = useFormSubmitHandler(form, isUploading, setIsUploading, onSuccess, previewURL);
  const { 
    watchIsExpense, 
    watchVendorType, 
    watchFiles, 
    watchCategory, 
    watchExpenseType,
    watchEntityType 
  } = useFormValueWatchers(form);
  
  const { initializeForm, handleCancel } = useFormInitialization({
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
  });
  
  // Run initialization once on mount
  useEffect(() => {
    initializeForm();
    
    // Cleanup function for preview URL
    return () => {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [initializeForm, previewURL]);

  return {
    form,
    isUploading,
    previewURL,
    showVendorSelector,
    setShowVendorSelector,
    handleFileSelect,
    onSubmit,
    initializeForm,
    handleCancel,
    watchIsExpense,
    watchVendorType,
    watchFiles,
    watchCategory,
    watchExpenseType,
    watchEntityType
  };
};
