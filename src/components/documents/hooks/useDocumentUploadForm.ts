import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { uploadDocument } from '../services/DocumentUploader';
import { 
  DocumentUploadFormValues, 
  documentUploadSchema, 
  EntityType,
  DocumentCategory
} from '../schemas/documentSchema';
import { useDebounce } from '@/hooks/useDebounce';

interface UseDocumentUploadFormProps {
  entityType: EntityType;
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
}

export const useDocumentUploadForm = ({
  entityType,
  entityId,
  onSuccess,
  onCancel,
  isReceiptUpload = false,
  prefillData
}: UseDocumentUploadFormProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [showVendorSelector, setShowVendorSelector] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  
  // Create the form with properly typed default values
  const defaultValues = useMemo(() => ({
    files: [] as File[],
    metadata: {
      category: (isReceiptUpload ? 'receipt' : 'other') as DocumentCategory,
      entityType: entityType,
      entityId: entityId || '',
      version: 1,
      tags: [] as string[],
      isExpense: isReceiptUpload ? true : false,
      vendorId: '',
      vendorType: 'vendor' as const,
      expenseType: 'materials' as const, // Default to materials for receipt uploads
    }
  }), [isReceiptUpload, entityType, entityId]);
  
  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues,
    mode: 'onChange'
  });

  // Memoize the file selection handler
  const handleFileSelect = useCallback((files: File[]) => {
    if (!files.length) return;
    
    form.setValue('files', files, { shouldValidate: true });
    
    if (files[0].type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(files[0]);
      setPreviewURL(previewUrl);
    } else {
      setPreviewURL(null);
    }
  }, [form]);

  // Use debounced values for the watchers to prevent excessive re-renders
  const watchIsExpense = useDebounce(form.watch('metadata.isExpense'), 300);
  const watchVendorType = useDebounce(form.watch('metadata.vendorType'), 300);
  const watchCategory = useDebounce(form.watch('metadata.category'), 300);
  const watchExpenseType = useDebounce(form.watch('metadata.expenseType'), 300);
  const watchFiles = form.watch('files');

  // Memoize the submit handler
  const onSubmit = useCallback(async (data: DocumentUploadFormValues) => {
    if (isUploading) return; // Prevent double submissions
    
    try {
      setIsUploading(true);
      
      const result = await uploadDocument(data);
      
      if (!result.success) {
        throw result.error || new Error('Upload failed');
      }
      
      toast({
        title: isReceiptUpload ? "Receipt uploaded successfully" : "Document uploaded successfully",
        description: isReceiptUpload 
          ? "Your receipt has been attached to this expense." 
          : "Your document has been uploaded and indexed."
      });
      
      // Reset form state
      form.reset();
      
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
        setPreviewURL(null);
      }
      
      // Call success callback with documentId
      if (onSuccess) {
        onSuccess(result.documentId);
      }
      
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your document.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, [form, isReceiptUpload, isUploading, onSuccess, previewURL]);

  // Initialize form values only once
  const initializeForm = useCallback(() => {
    if (isFormInitialized) return;

    // Only update these fields once to avoid re-rendering loops
    form.setValue('metadata.entityType', entityType);
    form.setValue('metadata.entityId', entityId || '');
    
    if (isReceiptUpload) {
      form.setValue('metadata.category', 'receipt' as DocumentCategory);
      form.setValue('metadata.isExpense', true);
      form.setValue('metadata.expenseType', 'materials');
      setShowVendorSelector(true);
    }
    
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
  }, [entityId, entityType, form, isFormInitialized, isReceiptUpload, prefillData]);

  // Run initialization once on mount
  useEffect(() => {
    initializeForm();
  }, [initializeForm]);

  // Create stable cancel handler
  const handleCancel = useCallback(() => {
    // Clean up before cancelling
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
      setPreviewURL(null);
    }
    
    // Reset form
    form.reset();
    
    // Call parent cancel handler
    if (onCancel) {
      onCancel();
    }
  }, [form, onCancel, previewURL]);

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
    watchExpenseType
  };
};
