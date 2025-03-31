
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
  
  // Create stable refs for all props to prevent effects from re-running
  const entityTypeRef = useRef(entityType);
  const entityIdRef = useRef(entityId);
  const isReceiptUploadRef = useRef(isReceiptUpload);
  const prefillDataRef = useRef(prefillData);
  const formInitialized = useRef(false);
  const uploadInProgress = useRef(false);
  
  // Update refs when props change
  useEffect(() => {
    entityTypeRef.current = entityType;
    entityIdRef.current = entityId;
    isReceiptUploadRef.current = isReceiptUpload;
    prefillDataRef.current = prefillData;
  }, [entityType, entityId, isReceiptUpload, prefillData]);

  // Create default values with stable references
  const defaultValues = useRef<DocumentUploadFormValues>({
    files: [],
    metadata: {
      category: isReceiptUpload ? 'receipt' as DocumentCategory : 'other' as DocumentCategory,
      entityType: entityType,
      entityId: entityId || '',
      version: 1,
      tags: [],
      isExpense: isReceiptUpload,
      vendorId: '',
      vendorType: 'vendor' as VendorType,
      expenseType: 'materials' as ExpenseType,
    }
  }).current;

  // Create form with stable default values
  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues,
    mode: 'onBlur', // Less validation, less re-renders
  });

  // Check bucket access once
  useEffect(() => {
    let isMounted = true;
    
    const checkBucket = async () => {
      try {
        const result = await testBucketAccess();
        if (isMounted && result.success && result.bucketId) {
          setBucketInfo({
            id: result.bucketId, 
            name: result.bucketName || result.bucketId
          });
        } else if (isMounted) {
          setBucketInfo({
            id: 'construction_documents', 
            name: 'Construction Documents'
          });
        }
      } catch (error) {
        if (isMounted) {
          setBucketInfo({
            id: 'construction_documents', 
            name: 'Construction Documents'
          });
        }
      }
    };
    
    checkBucket();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [previewURL]);

  // Handle file selection with a stable reference
  const handleFileSelect = useCallback((files: File[]) => {
    form.setValue('files', files, { shouldValidate: false });
    
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
      const newPreviewUrl = URL.createObjectURL(files[0]);
      setPreviewURL(newPreviewUrl);
    } else {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
      setPreviewURL(null);
    }
  }, [form, previewURL]);

  // Handle form submission with a stable reference and upload guard
  const onSubmit = useCallback(async (data: DocumentUploadFormValues) => {
    // Prevent double submission
    if (uploadInProgress.current) {
      return;
    }

    try {
      uploadInProgress.current = true;
      setIsUploading(true);
      
      const result = await uploadDocument(data);
      
      if (!result.success) {
        throw result.error || new Error('Upload failed');
      }
      
      // Show success message
      toast({
        title: isReceiptUploadRef.current ? "Receipt uploaded successfully" : "Document uploaded successfully",
        description: isReceiptUploadRef.current 
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
      uploadInProgress.current = false;
    }
  }, [form, previewURL, onSuccess]);

  // Initialize form once
  const initializeForm = useCallback(() => {
    if (formInitialized.current) return;
    
    // Set the receipt category and expense flag for receipt uploads
    if (isReceiptUploadRef.current) {
      form.setValue('metadata.category', 'receipt', { shouldValidate: false });
      form.setValue('metadata.isExpense', true, { shouldValidate: false });
      form.setValue('metadata.expenseType', 'materials', { shouldValidate: false });
      setShowVendorSelector(true);
    }
    
    // Ensure entity ID and type are updated
    form.setValue('metadata.entityId', entityIdRef.current || '', { shouldValidate: false });
    form.setValue('metadata.entityType', entityTypeRef.current, { shouldValidate: false });
    
    // Apply prefill data if available
    if (prefillDataRef.current) {
      if (prefillDataRef.current.amount) {
        form.setValue('metadata.amount', prefillDataRef.current.amount, { shouldValidate: false });
      }
      
      if (prefillDataRef.current.vendorId) {
        form.setValue('metadata.vendorId', prefillDataRef.current.vendorId, { shouldValidate: false });
      }
      
      const itemName = prefillDataRef.current.expenseName || prefillDataRef.current.materialName;
      if (itemName) {
        form.setValue('metadata.tags', [itemName], { shouldValidate: false });
        form.setValue('metadata.notes', `Receipt for: ${itemName}`, { shouldValidate: false });
      }
    }
    
    formInitialized.current = true;
  }, [form]);

  // Cancel handler with proper cleanup
  const handleCancel = useCallback(() => {
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
      setPreviewURL(null);
    }
    
    form.reset();
    
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
    handleCancel,
    // Watch what's needed with unique keys to avoid needless renders
    watchIsExpense: form.watch('metadata.isExpense'),
    watchVendorType: form.watch('metadata.vendorType'),
    watchFiles: form.watch('files'),
    watchCategory: form.watch('metadata.category')
  };
};
