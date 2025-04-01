
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { DocumentMetadata, documentUploadSchema, EntityType } from '../schemas/documentSchema';
import { supabase, DOCUMENTS_BUCKET_ID } from '@/integrations/supabase/client';

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
  
  // Initialize form with default values
  const form = useForm({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      files: [],
      metadata: {
        category: isReceiptUpload ? 'receipt' : 'other',
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
  
  // Watch form values
  const watchFiles = form.watch('files');
  const watchCategory = form.watch('metadata.category');
  const watchIsExpense = form.watch('metadata.isExpense');
  const watchVendorType = form.watch('metadata.vendorType');
  
  // Initialize form with prefill data and reset
  const initializeForm = useCallback(() => {
    const defaultValues = {
      files: [],
      metadata: {
        category: isReceiptUpload ? 'receipt' : 'other',
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
  
  // Handle file selection
  const handleFileSelect = useCallback((files: File[]) => {
    form.setValue('files', files);
    
    // Create preview URL for the first file if it's an image
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
      setPreviewURL(URL.createObjectURL(files[0]));
    } else {
      setPreviewURL(null);
    }
  }, [form, previewURL]);
  
  // Handle form submission
  const onSubmit = async (data: any) => {
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
      const file = data.files[0]; // Take the first file
      
      // Generate a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      // Create a logical folder structure for organization
      const basePath = data.metadata.entityType.toLowerCase();
      const filePath = `${basePath}/${data.metadata.entityId}/${fileName}`;
      
      console.log('Uploading file to path:', filePath);
      
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error(`Error uploading file: ${uploadError.message}`);
      }
      
      console.log('File uploaded successfully, now creating document record');
      
      // Create a document record in the database
      const documentData = {
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: filePath,
        entity_type: data.metadata.entityType,
        entity_id: data.metadata.entityId,
        category: data.metadata.category,
        tags: data.metadata.tags,
        is_expense: data.metadata.isExpense,
        amount: data.metadata.amount,
        expense_date: data.metadata.expenseDate,
        vendor_id: data.metadata.vendorId,
        vendor_type: data.metadata.vendorType,
        expense_type: data.metadata.expenseType,
        notes: data.metadata.notes,
      };
      
      const { data: document, error: documentError } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();
      
      if (documentError) {
        console.error('Error creating document record:', documentError);
        throw new Error(`Error creating document record: ${documentError.message}`);
      }
      
      console.log('Document record created successfully:', document);
      
      toast({
        title: 'Upload successful',
        description: 'Your document has been uploaded successfully.',
      });
      
      // Reset the form
      form.reset();
      
      // Revoke any object URLs to prevent memory leaks
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
        setPreviewURL(null);
      }
      
      // Call the success callback
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
  
  // Handle cancellation
  const handleCancel = () => {
    // Reset form
    form.reset();
    
    // Clean up any object URLs
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
      setPreviewURL(null);
    }
    
    // Call the cancel callback
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
