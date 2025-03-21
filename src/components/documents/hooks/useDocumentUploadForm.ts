
import { useState } from 'react';
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

interface UseDocumentUploadFormProps {
  entityType: EntityType;
  entityId?: string;
  onSuccess?: (documentId?: string) => void;
  onCancel?: () => void;
  onStartUpload?: () => void; // Added this property to fix the TypeScript error
  isReceiptUpload?: boolean;
  prefillData?: {
    amount?: number;
    vendorId?: string;
    materialName?: string;
    category?: DocumentCategory;
  };
}

export const useDocumentUploadForm = ({
  entityType,
  entityId,
  onSuccess,
  onCancel,
  onStartUpload,
  isReceiptUpload = false,
  prefillData
}: UseDocumentUploadFormProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [showVendorSelector, setShowVendorSelector] = useState(false);

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
        vendorType: 'vendor'
      }
    }
  });

  const handleFileSelect = (files: File[]) => {
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
      
      // Call onStartUpload if provided
      if (onStartUpload) {
        onStartUpload();
      }
      
      const result = await uploadDocument(data);
      
      if (!result.success) {
        throw result.error || new Error('Upload failed');
      }
      
      toast({
        title: isReceiptUpload ? "Receipt uploaded successfully" : "Document uploaded successfully",
        description: isReceiptUpload 
          ? "Your receipt has been attached to this material." 
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
      setShowVendorSelector(true);
    }
    
    if (prefillData) {
      if (prefillData.amount) {
        form.setValue('metadata.amount', prefillData.amount);
      }
      
      if (prefillData.vendorId) {
        form.setValue('metadata.vendorId', prefillData.vendorId);
      }
      
      if (prefillData.materialName) {
        form.setValue('metadata.tags', [prefillData.materialName]);
        form.setValue('metadata.notes', `Receipt for: ${prefillData.materialName}`);
      }

      if (prefillData.category) {
        form.setValue('metadata.category', prefillData.category);
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
    watchIsExpense: form.watch('metadata.isExpense'),
    watchVendorType: form.watch('metadata.vendorType'),
    watchFiles: form.watch('files'),
    watchCategory: form.watch('metadata.category')
  };
};
