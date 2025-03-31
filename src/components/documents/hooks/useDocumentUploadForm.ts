
import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { uploadDocument } from '../services/DocumentUploader';
import { testBucketAccess } from '../services/BucketTest';
import { 
  DocumentUploadFormValues, 
  documentUploadSchema, 
  EntityType,
  DocumentCategory,
  ExpenseType,
  VendorType
} from '../schemas/documentSchema';

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
  instanceId?: string;
}

export const useDocumentUploadForm = ({
  entityType,
  entityId,
  onSuccess,
  onCancel,
  isReceiptUpload = false,
  prefillData,
  instanceId = 'default-form'
}: UseDocumentUploadFormProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [showVendorSelector, setShowVendorSelector] = useState(false);
  const [bucketInfo, setBucketInfo] = useState<{id: string, name: string} | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Refs to prevent race conditions
  const uploadInProgress = useRef(false);
  const formInitialized = useRef(false);
  const instanceRef = useRef(instanceId);
  const isReceiptRef = useRef(isReceiptUpload);
  const entityIdRef = useRef(entityId);
  const entityTypeRef = useRef(entityType);
  
  // Ensure refs are always up to date
  useEffect(() => {
    instanceRef.current = instanceId;
    isReceiptRef.current = isReceiptUpload;
    entityIdRef.current = entityId;
    entityTypeRef.current = entityType;
  }, [instanceId, isReceiptUpload, entityId, entityType]);

  // Create a new form instance with a stable default values object
  const defaultValues: DocumentUploadFormValues = {
    files: [],
    metadata: {
      category: isReceiptUpload ? 'receipt' as DocumentCategory : 'other' as DocumentCategory,
      entityType: entityType,
      entityId: entityId || '',
      version: 1,
      tags: [],
      isExpense: isReceiptUpload ? true : false,
      vendorId: '',
      vendorType: 'vendor' as VendorType,
      expenseType: 'materials' as ExpenseType,
    }
  };

  // Create a new form instance for each component instance
  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues,
    mode: 'onBlur', // Validate on blur to reduce render cycles
  });

  // Modified bucket check to handle errors gracefully
  useEffect(() => {
    let isMounted = true;
    const checkBucket = async () => {
      try {
        const result = await testBucketAccess();
        if (result.success && result.bucketId && isMounted) {
          setBucketInfo({id: result.bucketId, name: result.bucketName || result.bucketId});
        } else if (isMounted) {
          // Fallback to default bucket name
          setBucketInfo({id: 'construction_documents', name: 'Construction Documents'});
        }
      } catch (error) {
        if (isMounted) {
          // Fallback to default bucket name on error
          setBucketInfo({id: 'construction_documents', name: 'Construction Documents'});
        }
      }
    };
    
    checkBucket();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [previewURL]);

  // Memoize the file select handler to prevent recreation
  const handleFileSelect = useCallback((files: File[]) => {
    form.setValue('files', files, { shouldValidate: false });
    
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
      const previewUrl = URL.createObjectURL(files[0]);
      setPreviewURL(previewUrl);
    } else {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
      setPreviewURL(null);
    }
  }, [form, previewURL]);

  // Memoize the submit handler to prevent recreation
  const onSubmit = useCallback(async (data: DocumentUploadFormValues) => {
    // Guard against multiple submissions
    if (uploadInProgress.current) {
      return;
    }

    try {
      uploadInProgress.current = true;
      setIsUploading(true);
      setUploadError(null);
      
      const result = await uploadDocument(data);
      
      if (!result.success) {
        throw result.error || new Error('Upload failed');
      }
      
      // Show success message
      toast({
        title: isReceiptRef.current ? "Receipt uploaded successfully" : "Document uploaded successfully",
        description: isReceiptRef.current 
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
      setUploadError(error.message || "There was an error uploading your document.");
      
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your document.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      uploadInProgress.current = false;
    }
  }, [form, previewURL, onSuccess]);

  // Memoize the initialize function to prevent recreation
  const initializeForm = useCallback(() => {
    // Only initialize once to prevent unnecessary re-renders
    if (formInitialized.current) {
      return;
    }
    
    // Set the receipt category and expense flag for receipt uploads
    if (isReceiptRef.current) {
      form.setValue('metadata.category', 'receipt' as DocumentCategory, { shouldValidate: false });
      form.setValue('metadata.isExpense', true, { shouldValidate: false });
      form.setValue('metadata.expenseType', 'materials' as ExpenseType, { shouldValidate: false });
      setShowVendorSelector(true);
    }
    
    // Always ensure entity ID and type are updated
    form.setValue('metadata.entityId', entityIdRef.current || '', { shouldValidate: false });
    form.setValue('metadata.entityType', entityTypeRef.current, { shouldValidate: false });
    
    // Apply prefill data if available
    if (prefillData) {
      if (prefillData.amount) {
        form.setValue('metadata.amount', prefillData.amount, { shouldValidate: false });
      }
      
      if (prefillData.vendorId) {
        form.setValue('metadata.vendorId', prefillData.vendorId, { shouldValidate: false });
      }
      
      const itemName = prefillData.expenseName || prefillData.materialName;
      if (itemName) {
        form.setValue('metadata.tags', [itemName], { shouldValidate: false });
        form.setValue('metadata.notes', `Receipt for: ${itemName}`, { shouldValidate: false });
      }
    }
    
    formInitialized.current = true;
  }, [form, prefillData]);

  // Memoize the cancel handler to prevent recreation
  const handleCancel = useCallback(() => {
    // Clean up before cancelling
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
      setPreviewURL(null);
    }
    
    // Reset form and error states
    form.reset();
    setUploadError(null);
    
    // Call parent cancel handler
    if (onCancel) {
      onCancel();
    }
  }, [form, previewURL, onCancel]);

  return {
    form,
    isUploading,
    previewURL,
    showVendorSelector,
    setShowVendorSelector,
    handleFileSelect,
    onSubmit,
    initializeForm,
    bucketInfo,
    uploadError,
    handleCancel,
    watchIsExpense: form.watch('metadata.isExpense'),
    watchVendorType: form.watch('metadata.vendorType'),
    watchFiles: form.watch('files'),
    watchCategory: form.watch('metadata.category'),
    watchExpenseType: form.watch('metadata.expenseType'),
    instanceId
  };
};
