
import { useState, useEffect, useRef } from 'react';
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
  const uploadInProgress = useRef(false);
  const formInitialized = useRef(false);

  // Add uniqueness identifier for debug tracking
  console.log(`Creating document upload form instance: ${instanceId} for entityType=${entityType}, entityId=${entityId || 'new'}`);

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
    defaultValues
  });

  // Modified bucket check to assume bucket exists if we've created it 
  // via SQL migration in Supabase
  useEffect(() => {
    const checkBucket = async () => {
      try {
        // First try to test the bucket access
        const result = await testBucketAccess();
        if (result.success && result.bucketId) {
          console.log(`✅ [${instanceId}] Successfully connected to bucket: ${result.bucketId}`);
          setBucketInfo({id: result.bucketId, name: result.bucketName || result.bucketId});
        } else {
          // If the test fails, we'll still try to proceed assuming the bucket exists
          // since we've created it in SQL
          console.warn(`⚠️ [${instanceId}] Could not confirm bucket access, but will attempt uploads:`, result.error);
          setBucketInfo({id: 'construction_documents', name: 'Construction Documents'});
        }
      } catch (error) {
        console.error(`❌ [${instanceId}] Error testing bucket access:`, error);
        // Assume the bucket exists since we've created it in SQL
        setBucketInfo({id: 'construction_documents', name: 'Construction Documents'});
      }
    };
    
    checkBucket();
  }, [instanceId]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log(`[${instanceId}] Cleaning up form resources`);
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [previewURL, instanceId]);

  const handleFileSelect = (files: File[]) => {
    console.log(`[${instanceId}] Files selected in handleFileSelect:`, files.map(f => f.name));
    
    form.setValue('files', files);
    
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
  };

  const onSubmit = async (data: DocumentUploadFormValues) => {
    // Guard against multiple submissions
    if (uploadInProgress.current) {
      console.log(`[${instanceId}] Upload already in progress, skipping`);
      return;
    }

    try {
      uploadInProgress.current = true;
      setIsUploading(true);
      setUploadError(null);
      
      console.log(`[${instanceId}] Submitting files:`, data.files.map(f => f.name));
      console.log(`[${instanceId}] Form metadata:`, data.metadata);
      
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
        console.log(`[${instanceId}] Calling onSuccess with document ID:`, result.documentId);
        onSuccess(result.documentId);
      }
      
    } catch (error: any) {
      console.error(`[${instanceId}] Upload error:`, error);
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
  };

  const initializeForm = () => {
    // Only initialize once to prevent unnecessary re-renders
    if (formInitialized.current) {
      console.log(`[${instanceId}] Form already initialized, skipping`);
      return;
    }
    
    console.log(`[${instanceId}] Initializing form for entityId=${entityId}, entityType=${entityType}`);
    
    // Set the receipt category and expense flag for receipt uploads
    if (isReceiptUpload) {
      form.setValue('metadata.category', 'receipt' as DocumentCategory);
      form.setValue('metadata.isExpense', true);
      form.setValue('metadata.expenseType', 'materials' as ExpenseType);
      setShowVendorSelector(true);
    }
    
    // Always ensure entity ID is updated
    form.setValue('metadata.entityId', entityId || '');
    form.setValue('metadata.entityType', entityType);
    
    // Apply prefill data if available
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
    
    formInitialized.current = true;
  };

  const handleCancel = () => {
    // Clean up before cancelling
    console.log(`[${instanceId}] Handling cancel, cleaning up resources`);
    
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
      setPreviewURL(null);
    }
    
    // Reset form
    form.reset();
    setUploadError(null);
    
    // Call parent cancel handler
    if (onCancel) {
      onCancel();
    }
  };

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
