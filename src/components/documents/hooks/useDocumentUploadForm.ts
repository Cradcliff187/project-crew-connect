
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { uploadDocument } from '../services/DocumentUploader';
import { testBucketAccess } from '../services/BucketTest';
import { 
  DocumentUploadFormValues, 
  documentUploadSchema, 
  EntityType 
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
  const [bucketInfo, setBucketInfo] = useState<{id: string, name: string} | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      files: [],
      metadata: {
        category: isReceiptUpload ? 'receipt' : 'other',
        entityType: entityType,
        entityId: entityId || '',
        version: 1,
        tags: [],
        isExpense: isReceiptUpload ? true : false,
        vendorId: '',
        vendorType: 'vendor',
        expenseType: 'materials', // Default to materials for receipt uploads
      }
    }
  });

  // Check bucket only once on mount
  useEffect(() => {
    const checkBucket = async () => {
      try {
        // Instead of checking the bucket every time, assume it exists
        setBucketInfo({id: 'construction_documents', name: 'Construction Documents'});
      } catch (error) {
        console.error('❌ Error with bucket access:', error);
        // Still set the bucket info to avoid blocking uploads
        setBucketInfo({id: 'construction_documents', name: 'Construction Documents'});
      }
    };
    
    checkBucket();
  }, []);

  // Memoize the file selection handler
  const handleFileSelect = useCallback((files: File[]) => {
    if (!files.length) return;
    
    form.setValue('files', files);
    
    if (files[0].type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(files[0]);
      setPreviewURL(previewUrl);
    } else {
      setPreviewURL(null);
    }
  }, [form]);

  // Memoize the submit handler
  const onSubmit = useCallback(async (data: DocumentUploadFormValues) => {
    if (isUploading) return; // Prevent double submissions
    
    try {
      setIsUploading(true);
      setUploadError(null);
      
      console.log('Submitting document upload...');
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
        console.log('Upload successful, document ID:', result.documentId);
        onSuccess(result.documentId);
      }
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || "There was an error uploading your document.");
      
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
    
    form.setValue('metadata.entityType', entityType);
    form.setValue('metadata.entityId', entityId || '');
    
    if (isReceiptUpload) {
      form.setValue('metadata.category', 'receipt');
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

  const handleCancel = useCallback(() => {
    // Clean up before cancelling
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
    bucketInfo,
    uploadError,
    handleCancel,
    watchIsExpense: form.watch('metadata.isExpense'),
    watchVendorType: form.watch('metadata.vendorType'),
    watchFiles: form.watch('files'),
    watchCategory: form.watch('metadata.category'),
    watchExpenseType: form.watch('metadata.expenseType')
  };
};
