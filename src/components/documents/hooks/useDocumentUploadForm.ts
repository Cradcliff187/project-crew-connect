
import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityType, DocumentCategory, documentUploadSchema, DocumentUploadFormValues } from '../schemas/documentSchema';
import { useToast } from '@/hooks/use-toast';
import { uploadDocument } from '@/utils/documentUploader';
import { isValidDocumentCategory, toDocumentCategory, getEntityCategories } from '../utils/DocumentCategoryHelper';

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
    category?: string;
    tags?: string[];
  };
  preventFormPropagation?: boolean;
  allowEntityTypeSelection?: boolean;
  onEntityTypeChange?: (entityType: EntityType) => void;
}

export const useDocumentUploadForm = ({
  entityType = 'PROJECT',
  entityId,
  onSuccess,
  onCancel,
  isReceiptUpload = false,
  prefillData,
  allowEntityTypeSelection = false,
  onEntityTypeChange,
}: UseDocumentUploadFormProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [showVendorSelector, setShowVendorSelector] = useState(false);
  const { toast } = useToast();

  // Initialize the form
  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      files: [],
      metadata: {
        category: isReceiptUpload ? 'receipt' : 'other',
        entityType: entityType,
        entityId: entityId || '',
        amount: prefillData?.amount,
        expenseDate: new Date(),
        version: 1,
        tags: prefillData?.tags || [],
        notes: prefillData?.notes || '',
        isExpense: isReceiptUpload,
        vendorId: prefillData?.vendorId,
      }
    }
  });
  
  // Watch form values
  const watchFiles = form.watch('files');
  const watchCategory = form.watch('metadata.category');
  const watchIsExpense = form.watch('metadata.isExpense');
  const watchVendorType = form.watch('metadata.vendorType');
  const watchExpenseType = form.watch('metadata.expenseType');
  const watchEntityType = form.watch('metadata.entityType');
  
  // Get available categories for current entity type
  const availableCategories = getEntityCategories(watchEntityType);

  // Initialize form with prefill data or defaults
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

  // Initialize form on component mount and when dependencies change
  useEffect(() => {
    initializeForm();
  }, [initializeForm]);

  // Handle file selection
  const handleFileSelect = useCallback((files: File[]) => {
    if (files.length > 0) {
      // Set preview URL for the first file if it's an image
      if (files[0].type.startsWith('image/')) {
        const url = URL.createObjectURL(files[0]);
        setPreviewURL(url);
        
        // Cleanup the URL when component unmounts
        return () => URL.revokeObjectURL(url);
      } else {
        setPreviewURL(null);
      }
      
      // Update form with selected files
      form.setValue('files', files);
    }
  }, [form]);

  // Handle form submission
  const onSubmit = useCallback(async (data: DocumentUploadFormValues) => {
    setIsUploading(true);
    
    try {
      // Upload document
      const result = await uploadDocument(data.files[0], data.metadata);
      
      if (result.success) {
        toast({
          title: 'Document uploaded successfully',
          description: `${data.files[0].name} has been uploaded.`,
        });
        
        // Reset form and call onSuccess callback
        form.reset();
        setPreviewURL(null);
        
        if (onSuccess) {
          onSuccess(result.documentId);
        }
      } else {
        throw new Error(result.error || 'Failed to upload document');
      }
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Something went wrong while uploading your document.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [form, toast, onSuccess]);

  // Handle cancellation
  const handleCancel = useCallback(() => {
    // Reset form state
    form.reset();
    setPreviewURL(null);
    
    // Call onCancel callback
    if (onCancel) {
      onCancel();
    }
  }, [form, onCancel]);

  // Handle form submission with event prevention
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    if (e) e.preventDefault();
    return form.handleSubmit(onSubmit)(e);
  }, [form, onSubmit]);

  // Watch for entity type changes
  useEffect(() => {
    if (onEntityTypeChange && watchEntityType && watchEntityType !== entityType) {
      onEntityTypeChange(watchEntityType);
    }
  }, [watchEntityType, entityType, onEntityTypeChange]);

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

export default useDocumentUploadForm;
