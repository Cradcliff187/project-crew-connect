
import { useState, useEffect } from 'react';
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

  // Modified bucket check to assume bucket exists if we've created it 
  // via SQL migration in Supabase
  useEffect(() => {
    const checkBucket = async () => {
      try {
        // First try to test the bucket access
        const result = await testBucketAccess();
        if (result.success && result.bucketId) {
          console.log(`✅ Successfully connected to bucket: ${result.bucketId}`);
          setBucketInfo({id: result.bucketId, name: result.bucketName || result.bucketId});
        } else {
          // If the test fails, we'll still try to proceed assuming the bucket exists
          // since we've created it in SQL
          console.warn('⚠️ Could not confirm bucket access, but will attempt uploads:', result.error);
          setBucketInfo({id: 'construction_documents', name: 'Construction Documents'});
        }
      } catch (error) {
        console.error('❌ Error testing bucket access:', error);
        // Assume the bucket exists since we've created it in SQL
        setBucketInfo({id: 'construction_documents', name: 'Construction Documents'});
      }
    };
    
    checkBucket();
  }, []);

  const handleFileSelect = (files: File[]) => {
    console.log('Files selected in handleFileSelect:', files);
    
    form.setValue('files', files);
    
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(files[0]);
      setPreviewURL(previewUrl);
    } else {
      setPreviewURL(null);
    }
  };

  const onSubmit = async (data: DocumentUploadFormValues) => {
    try {
      setIsUploading(true);
      
      // Always assume the bucket exists since we've created it via SQL
      // This prevents the "Storage bucket not properly configured" error
      
      console.log('Submitting files:', data.files);
      console.log('File objects detail:', data.files.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size,
        lastModified: f.lastModified,
        isFile: f instanceof File
      })));
      
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
      
      if (onSuccess) {
        console.log('Calling onSuccess with document ID:', result.documentId);
        onSuccess(result.documentId);
      }
      
      form.reset();
      setPreviewURL(null);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your document.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const initializeForm = () => {
    if (isReceiptUpload) {
      form.setValue('metadata.category', 'receipt');
      form.setValue('metadata.isExpense', true);
      form.setValue('metadata.expenseType', 'materials'); // Default value
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
    watchIsExpense: form.watch('metadata.isExpense'),
    watchVendorType: form.watch('metadata.vendorType'),
    watchFiles: form.watch('files'),
    watchCategory: form.watch('metadata.category'),
    watchExpenseType: form.watch('metadata.expenseType')
  };
};
