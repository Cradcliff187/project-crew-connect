import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { DocumentService } from '../services/DocumentService';
import { 
  DocumentMetadata, 
  documentUploadSchema, 
  EntityType,
  DocumentCategory,
  DocumentUploadFormValues,
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

export function useDocumentUploadForm({
  entityType,
  entityId,
  onSuccess,
  onCancel,
  isReceiptUpload = false,
  prefillData,
  instanceId = 'default'
}: UseDocumentUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [showVendorSelector, setShowVendorSelector] = useState(isReceiptUpload);
  
  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      files: [],
      metadata: {
        category: (isReceiptUpload ? 'receipt' : 'other') as DocumentCategory,
        entityType,
        entityId: entityId || '',
        amount: prefillData?.amount,
        isExpense: isReceiptUpload,
        vendorId: prefillData?.vendorId,
        tags: [],
        version: 1,
      }
    }
  });
  
  const watchFiles = form.watch('files');
  const watchCategory = form.watch('metadata.category') as DocumentCategory;
  const watchIsExpense = form.watch('metadata.isExpense');
  const watchVendorType = form.watch('metadata.vendorType') as VendorType;
  
  const initializeForm = useCallback(() => {
    const defaultValues: DocumentUploadFormValues = {
      files: [],
      metadata: {
        category: (isReceiptUpload ? 'receipt' : 'other') as DocumentCategory,
        entityType,
        entityId: entityId || '',
        amount: prefillData?.amount,
        isExpense: isReceiptUpload,
        vendorId: prefillData?.vendorId,
        tags: [],
        version: 1,
      }
    };
    
    form.reset(defaultValues);
    
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
      setPreviewURL(null);
    }
  }, [form, entityType, entityId, isReceiptUpload, prefillData, previewURL]);
  
  const handleFileSelect = useCallback((files: File[]) => {
    form.setValue('files', files);
    
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
      setPreviewURL(URL.createObjectURL(files[0]));
    } else {
      setPreviewURL(null);
    }
  }, [form, previewURL]);
  
  const onSubmit = async (data: DocumentUploadFormValues) => {
    if (data.files.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select at least one file to upload',
        variant: 'destructive',
      });
      return;
    }
    
    if (!data.metadata.entityId) {
      toast({
        title: 'Missing entity ID',
        description: 'Entity ID is required',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      console.log('Starting file upload with data:', data);
      const file = data.files[0];
      
      const document = await DocumentService.uploadDocument(
        file,
        data.metadata.entityType,
        data.metadata.entityId,
        {
          category: data.metadata.category,
          isExpense: data.metadata.isExpense,
          vendorId: data.metadata.vendorId,
          vendorType: data.metadata.vendorType,
          amount: data.metadata.amount,
          expenseDate: data.metadata.expenseDate,
          expenseType: data.metadata.expenseType,
          notes: data.metadata.notes,
          tags: data.metadata.tags,
        }
      );
      
      if (!document) {
        throw new Error('Failed to upload document');
      }
      
      console.log('Document uploaded successfully:', document);
      
      toast({
        title: 'Upload successful',
        description: 'Your document has been uploaded successfully.',
      });
      
      form.reset();
      
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
        setPreviewURL(null);
      }
      
      if (onSuccess) {
        onSuccess(document.document_id);
      }
    } catch (error: any) {
      console.error('Error in document upload:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleCancel = () => {
    form.reset();
    
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
      setPreviewURL(null);
    }
    
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
    watchIsExpense,
    watchVendorType,
    watchFiles,
    watchCategory,
    handleCancel
  };
}
