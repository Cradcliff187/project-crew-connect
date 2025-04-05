
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  DocumentUploadFormValues, 
  EntityType, 
  documentUploadSchema, 
  getEntityCategories,
  documentCategories
} from '../schemas/documentSchema';
import { useFormSubmitHandler } from './useFormSubmitHandler';

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
    notes?: string;
    tags?: string[];
    category?: string;
    budgetItemId?: string;
    parentEntityType?: string;
    parentEntityId?: string;
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
  const [showVendorSelector, setShowVendorSelector] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>(
    entityType ? getEntityCategories(entityType) : []
  );

  // Initialize form
  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      files: [],
      metadata: {
        category: isReceiptUpload ? 'receipt' : (prefillData?.category || documentCategories[0]),
        entityType: entityType || 'PROJECT',
        entityId: entityId || '',
        isExpense: isReceiptUpload,
        tags: prefillData?.tags || [],
        version: 1
      }
    }
  });

  // Watch form values for conditional display
  const watchIsExpense = form.watch('metadata.isExpense');
  const watchVendorType = form.watch('metadata.vendorType');
  const watchFiles = form.watch('files');
  const watchCategory = form.watch('metadata.category');
  const watchExpenseType = form.watch('metadata.expenseType');
  const watchEntityType = form.watch('metadata.entityType');

  // Handle file selection
  const handleFileSelect = useCallback((files: File[]) => {
    form.setValue('files', files);
    
    // Create preview URL for the first file if it's an image
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      const url = URL.createObjectURL(files[0]);
      setPreviewURL(url);
    } else {
      setPreviewURL(null);
    }
  }, [form]);

  // Handle form submission
  const { onSubmit } = useFormSubmitHandler(form, isUploading, setIsUploading, onSuccess, previewURL);

  // Initialize form with default values
  const initializeForm = useCallback(() => {
    if (entityType && entityId) {
      form.setValue('metadata.entityType', entityType);
      form.setValue('metadata.entityId', entityId);
      
      // Update available categories based on entity type
      setAvailableCategories(getEntityCategories(entityType));

      // Set default category for entity type
      if (isReceiptUpload) {
        form.setValue('metadata.category', 'receipt');
        form.setValue('metadata.isExpense', true);
      } else if (entityType === 'WORK_ORDER') {
        form.setValue('metadata.category', 'receipt');
      } else if (entityType === 'PROJECT') {
        form.setValue('metadata.category', 'photo');
      } else if (entityType === 'VENDOR' || entityType === 'SUBCONTRACTOR') {
        form.setValue('metadata.category', 'certification');
      }
    }
    
    // Initialize with prefill data if available
    if (prefillData) {
      if (prefillData.amount !== undefined) {
        form.setValue('metadata.amount', prefillData.amount);
      }
      
      if (prefillData.vendorId) {
        form.setValue('metadata.vendorId', prefillData.vendorId);
        setShowVendorSelector(true);
        form.setValue('metadata.vendorType', 'vendor');
      }
      
      if (prefillData.notes) {
        form.setValue('metadata.notes', prefillData.notes);
      }
      
      if (prefillData.tags && prefillData.tags.length > 0) {
        form.setValue('metadata.tags', prefillData.tags);
      }
      
      if (prefillData.category) {
        form.setValue('metadata.category', prefillData.category);
      }
      
      if (prefillData.budgetItemId) {
        form.setValue('metadata.budgetItemId', prefillData.budgetItemId);
      }
      
      if (prefillData.parentEntityType && prefillData.parentEntityId) {
        form.setValue('metadata.parentEntityType', prefillData.parentEntityType as EntityType);
        form.setValue('metadata.parentEntityId', prefillData.parentEntityId);
      }
    }
  }, [entityType, entityId, form, isReceiptUpload, prefillData]);
  
  // Handle cancel button
  const handleCancel = useCallback(() => {
    // Cleanup any previews
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
    }
    
    // Reset form
    form.reset();
    
    // Call onCancel callback if provided
    if (onCancel) {
      onCancel();
    }
  }, [form, onCancel, previewURL]);
  
  // Handle form submission
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    if (preventFormPropagation) {
      e.stopPropagation();
    }
    
    form.handleSubmit(onSubmit)(e);
  }, [form, onSubmit, preventFormPropagation]);
  
  // Initialize the form on mount
  useEffect(() => {
    initializeForm();
  }, [initializeForm]);
  
  // Notify parent component when entity type changes
  useEffect(() => {
    if (onEntityTypeChange && watchEntityType) {
      onEntityTypeChange(watchEntityType);
    }
  }, [watchEntityType, onEntityTypeChange]);

  // Update categories when entity type changes
  useEffect(() => {
    setAvailableCategories(getEntityCategories(watchEntityType));
  }, [watchEntityType]);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [previewURL]);
  
  // Show vendor selector when watching vendor type changes
  useEffect(() => {
    if (watchVendorType) {
      setShowVendorSelector(true);
    }
  }, [watchVendorType]);

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
