
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  DocumentUploadFormValues, 
  documentUploadSchema, 
  EntityType,
  DocumentCategory,
} from '../schemas/documentSchema';
import { isValidDocumentCategory, toDocumentCategory, getEntityCategories } from '../utils/DocumentCategoryHelper';
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
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [showVendorSelector, setShowVendorSelector] = useState(false);
  
  // Set up form with initial values and validation
  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      files: [],
      metadata: {
        entityType: entityType || 'PROJECT',
        entityId: entityId || '',
        category: 'other',
        tags: [],
        isExpense: false,
        version: 1,
      }
    }
  });
  
  // Use helper hooks for form functionality
  const { handleFileSelect } = useFileSelectionHandling(form, setPreviewURL);
  const { onSubmit } = useFormSubmitHandler(form, isUploading, setIsUploading, onSuccess, previewURL);
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
  
  // Get form values to watch
  const {
    watchIsExpense,
    watchVendorType,
    watchFiles,
    watchCategory,
    watchExpenseType,
    watchEntityType,
    needsVendorSelection
  } = useFormValueWatchers(form);
  
  // Initialize form with proper values
  useEffect(() => {
    initializeForm();
  }, [initializeForm]);
  
  // Watch for changes that would require showing the vendor selector
  useEffect(() => {
    setShowVendorSelector(needsVendorSelection());
  }, [watchIsExpense, watchCategory, watchEntityType, needsVendorSelection]);
  
  // Watch for entity type changes
  useEffect(() => {
    if (onEntityTypeChange && watchEntityType !== entityType) {
      onEntityTypeChange(watchEntityType);
    }
  }, [watchEntityType, onEntityTypeChange, entityType]);
  
  // Create an available categories array based on entity type
  const availableCategories = watchEntityType ? getEntityCategories(watchEntityType) : [];
  
  // Handler for form submission
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit(onSubmit)(e);
  }, [form, onSubmit]);
  
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
    watchIsExpense,
    watchVendorType,
    watchFiles,
    watchCategory,
    watchExpenseType,
    watchEntityType
  };
};
