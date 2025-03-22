
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { 
  documentUploadSchema, 
  DocumentUploadFormValues, 
  EntityType,
  PrefillData
} from '../schemas/documentSchema';
import { uploadDocument } from '../services/DocumentUploader';

interface UseDocumentUploadFormProps {
  entityType: EntityType;
  entityId?: string;
  onSuccess?: (documentId?: string) => void;
  onCancel?: () => void;
  isReceiptUpload?: boolean;
  prefillData?: PrefillData;
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
  const [showSubcontractorSelector, setShowSubcontractorSelector] = useState(false);
  
  // Initialize the form with react-hook-form and zod validation
  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      files: [],
      metadata: {
        category: isReceiptUpload ? 'receipt' : 'other',
        entityType: entityType,
        entityId: entityId,
        isExpense: isReceiptUpload || false,
        tags: [],
        version: 1,
        // Initialize with prefill data if available
        amount: prefillData?.amount,
        vendorId: prefillData?.vendorId,
        subcontractorId: prefillData?.subcontractorId,
      }
    }
  });
  
  // Get form values to watch
  const watchIsExpense = form.watch('metadata.isExpense');
  const watchCategory = form.watch('metadata.category');
  const watchFiles = form.watch('files') || [];
  
  // Initialize form based on prefill data and receipt mode
  const initializeForm = () => {
    console.log('Initializing document upload form with:', { 
      entityType, 
      entityId, 
      isReceiptUpload, 
      prefillData 
    });
    
    form.reset({
      files: [],
      metadata: {
        category: isReceiptUpload ? 'receipt' : 'other',
        entityType: entityType,
        entityId: entityId,
        isExpense: isReceiptUpload || false,
        tags: [],
        version: 1,
        amount: prefillData?.amount,
        vendorId: prefillData?.vendorId,
        subcontractorId: prefillData?.subcontractorId,
      }
    });
    
    // If this is a receipt upload, automatically show vendor selector
    if (isReceiptUpload) {
      if (prefillData?.vendorId) {
        setShowVendorSelector(true);
        setShowSubcontractorSelector(false);
      } else if (prefillData?.subcontractorId) {
        setShowVendorSelector(false);
        setShowSubcontractorSelector(true);
      } else {
        // Default to vendor for receipt uploads
        setShowVendorSelector(true);
      }
    }
  };
  
  // Handle file selection
  const handleFileSelect = (files: File[]) => {
    if (!files.length) return;
    
    form.setValue('files', files, { shouldValidate: true });
    
    // Generate preview URL for the first file
    if (files[0] && files[0].type.startsWith('image/')) {
      const url = URL.createObjectURL(files[0]);
      setPreviewURL(url);
    } else {
      setPreviewURL(null);
    }
    
    // If it's a receipt, automatically set isExpense to true
    if (files[0] && /receipt|invoice/i.test(files[0].name)) {
      form.setValue('metadata.isExpense', true);
      form.setValue('metadata.category', 'receipt');
      setShowVendorSelector(true);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: DocumentUploadFormValues) => {
    console.log('Submitting document upload form with data:', data);
    setIsUploading(true);
    
    try {
      const result = await uploadDocument(data);
      
      if (!result.success) {
        throw new Error('Failed to upload document');
      }
      
      console.log('Document uploaded successfully with ID:', result.documentId);
      
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully.",
      });
      
      // Clear the preview URL
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
        setPreviewURL(null);
      }
      
      // Call the onSuccess callback with the document ID
      if (onSuccess) {
        onSuccess(result.documentId);
      }
      
    } catch (error: any) {
      console.error('Error uploading document:', error);
      
      toast({
        title: "Upload failed",
        description: error.message || "There was a problem uploading your document.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [previewURL]);
  
  return {
    form,
    isUploading,
    previewURL,
    showVendorSelector,
    showSubcontractorSelector,
    setShowVendorSelector,
    setShowSubcontractorSelector,
    handleFileSelect,
    onSubmit,
    initializeForm,
    watchIsExpense,
    watchCategory,
    watchFiles
  };
};
