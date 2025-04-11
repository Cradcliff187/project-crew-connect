
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  DocumentUploadFormValues, 
  EntityType, 
  DocumentUploadSchema,
  getEntityCategories,
  DocumentCategory
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
    parentEntityType?: EntityType;
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
  const [availableCategories, setAvailableCategories] = useState<DocumentCategory[]>(
    entityType ? getEntityCategories(entityType) : []
  );

  const defaultEntityType = entityType || EntityType.PROJECT;

  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(DocumentUploadSchema),
    defaultValues: {
      files: [],
      metadata: {
        category: isReceiptUpload ? DocumentCategory.RECEIPT : (prefillData?.category as DocumentCategory || DocumentCategory.OTHER),
        entityType: defaultEntityType,
        entityId: entityId || '',
        isExpense: isReceiptUpload,
        tags: prefillData?.tags || [],
        version: 1
      }
    }
  });

  const watchIsExpense = form.watch('metadata.isExpense');
  const watchVendorType = form.watch('metadata.vendorType');
  const watchFiles = form.watch('files');
  const watchCategory = form.watch('metadata.category');
  const watchExpenseType = form.watch('metadata.expenseType');
  const watchEntityType = form.watch('metadata.entityType');

  const handleFileSelect = useCallback((files: File[]) => {
    form.setValue('files', files);
    
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      const url = URL.createObjectURL(files[0]);
      setPreviewURL(url);
    } else {
      setPreviewURL(null);
    }
  }, [form]);

  const { onSubmit } = useFormSubmitHandler(form, isUploading, setIsUploading, onSuccess, previewURL);

  const initializeForm = useCallback(() => {
    if (entityType && entityId) {
      form.setValue('metadata.entityType', entityType);
      form.setValue('metadata.entityId', entityId);
      
      setAvailableCategories(getEntityCategories(entityType));

      if (isReceiptUpload) {
        form.setValue('metadata.category', DocumentCategory.RECEIPT);
        form.setValue('metadata.isExpense', true);
      } else if (entityType === EntityType.WORK_ORDER) {
        form.setValue('metadata.category', DocumentCategory.RECEIPT);
      } else if (entityType === EntityType.PROJECT) {
        form.setValue('metadata.category', DocumentCategory.PHOTO);
      } else if (entityType === EntityType.VENDOR || entityType === EntityType.SUBCONTRACTOR) {
        form.setValue('metadata.category', DocumentCategory.CERTIFICATION);
      }
    }
    
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
        form.setValue('metadata.category', prefillData.category as DocumentCategory);
      }
      
      if (prefillData.budgetItemId) {
        form.setValue('metadata.budgetItemId', prefillData.budgetItemId);
      }
      
      if (prefillData.parentEntityType && prefillData.parentEntityId) {
        form.setValue('metadata.parentEntityType', prefillData.parentEntityType);
        form.setValue('metadata.parentEntityId', prefillData.parentEntityId);
      }
    }
  }, [entityType, entityId, form, isReceiptUpload, prefillData]);

  const handleCancel = useCallback(() => {
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
    }
    
    form.reset();
    
    if (onCancel) {
      onCancel();
    }
  }, [form, onCancel, previewURL]);

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    if (preventFormPropagation) {
      e.stopPropagation();
    }
    
    form.handleSubmit(onSubmit)(e);
  }, [form, onSubmit, preventFormPropagation]);

  useEffect(() => {
    initializeForm();
  }, [initializeForm]);

  useEffect(() => {
    if (onEntityTypeChange && watchEntityType) {
      onEntityTypeChange(watchEntityType);
    }
  }, [watchEntityType, onEntityTypeChange]);

  useEffect(() => {
    setAvailableCategories(getEntityCategories(watchEntityType));
  }, [watchEntityType]);

  useEffect(() => {
    return () => {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [previewURL]);

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
