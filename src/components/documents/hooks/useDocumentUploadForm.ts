
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  DocumentUploadFormValues, 
  documentUploadSchema, 
  EntityType,
  DocumentCategory,
  getEntityCategories
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
    category?: string;
    tags?: string[];
    notes?: string;
  };
  allowEntityTypeSelection?: boolean;
  preventFormPropagation?: boolean;
  onEntityTypeChange?: (entityType: EntityType) => void;
}

export const useDocumentUploadForm = ({
  entityType,
  entityId,
  onSuccess,
  onCancel,
  isReceiptUpload = false,
  prefillData,
  allowEntityTypeSelection = false,
  preventFormPropagation = false,
  onEntityTypeChange
}: UseDocumentUploadFormProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [showVendorSelector, setShowVendorSelector] = useState(isReceiptUpload || !!prefillData?.vendorId);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  
  // Get default category with proper type casting
  const getDefaultCategory = (): DocumentCategory => {
    if (prefillData?.category && isValidDocumentCategory(prefillData.category)) {
      return prefillData.category as DocumentCategory;
    }
    return isReceiptUpload ? 'receipt' : 'other';
  };
  
  // Create form with default values
  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      files: [] as File[],
      metadata: {
        category: getDefaultCategory(),
        entityType: entityType || 'PROJECT',
        entityId: entityId || '',
        version: 1,
        tags: prefillData?.tags || [],
        isExpense: isReceiptUpload ? true : false,
        vendorId: prefillData?.vendorId || '',
        vendorType: 'vendor',
        expenseType: 'materials',
        notes: prefillData?.notes || ''
      }
    },
    mode: 'onChange'
  });

  // Helper function to validate if a string is a valid DocumentCategory
  function isValidDocumentCategory(category: string): boolean {
    return ['invoice', 'receipt', '3rd_party_estimate', 'contract', 'insurance', 
            'certification', 'photo', 'other'].includes(category);
  }

  // Use our custom hooks to handle different aspects of the form
  const { handleFileSelect } = useFileSelectionHandling(form, setPreviewURL);
  const { onSubmit } = useFormSubmitHandler(form, isUploading, setIsUploading, onSuccess, previewURL);
  const formValueWatchers = useFormValueWatchers(form);
  
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

  // Auto-show vendor selector when receipt category is selected
  useEffect(() => {
    const category = form.watch('metadata.category');
    const isExpense = form.watch('metadata.isExpense');
    const currentEntityType = form.watch('metadata.entityType');
    
    if (
      category === 'receipt' || 
      category === 'invoice' || 
      isExpense || 
      currentEntityType === 'VENDOR' || 
      currentEntityType === 'SUBCONTRACTOR'
    ) {
      setShowVendorSelector(true);
    }
  }, [form]);

  // Notify parent about entity type changes if callback provided
  useEffect(() => {
    const currentEntityType = form.watch('metadata.entityType');
    if (onEntityTypeChange && currentEntityType) {
      onEntityTypeChange(currentEntityType);
    }
  }, [form, onEntityTypeChange]);

  // Handle form submission with explicit event prevention
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    // Always prevent default to handle submission manually
    e.preventDefault(); 
    
    // Stop propagation if requested (prevents bubbling to parent forms)
    if (preventFormPropagation) {
      e.stopPropagation();
    }
    
    // Use the form submission handler from the custom hook
    form.handleSubmit((data) => {
      onSubmit(data);
    })(e);
  }, [form, onSubmit, preventFormPropagation]);

  // Get the available categories based on entity type
  const availableCategories = useCallback(() => {
    const currentEntityType = form.watch('metadata.entityType');
    if (currentEntityType) {
      return getEntityCategories(currentEntityType);
    }
    return [];
  }, [form]);

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
    handleFormSubmit,
    availableCategories,
    ...formValueWatchers
  };
};
