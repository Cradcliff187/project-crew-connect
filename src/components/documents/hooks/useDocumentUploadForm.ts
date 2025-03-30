import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DocumentUploadFormValues,
  documentUploadSchema,
  EntityType,
  ExpenseType
} from '../schemas/documentSchema';
import { toast } from '@/hooks/use-toast';
import { DocumentUploader } from '../services/DocumentUploader';
import { PrefillData } from '../types/documentTypes';

export const useDocumentUploadForm = (
  entityType: EntityType,
  entityId: string,
  onSuccess?: (documentId?: string) => void,
  isReceiptUpload = false,
  prefillData?: PrefillData
) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  
  // Initialize form with default values
  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      files: undefined,
      metadata: {
        entityType: entityType,
        entityId: entityId !== 'pending' ? entityId : undefined,
        isExpense: isReceiptUpload,
        tags: [],
        // For receipt uploads, default to material expense type
        expenseType: isReceiptUpload ? 'material' as ExpenseType : undefined,
        amount: prefillData?.amount
      }
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      form.setValue("files", Array.from(e.target.files));
    }
  };

  const handleSubmit = async (values: DocumentUploadFormValues) => {
    setIsUploading(true);
    setProgressPercent(0);

    try {
      // Perform upload logic
      const result = await DocumentUploader.uploadDocument(values);

      if (result.success && result.documentId) {
        toast({
          title: "Upload successful",
          description: "Your document has been uploaded.",
        });
        
        // Reset form after successful upload
        form.reset({
          files: undefined,
          metadata: {
            entityType: entityType,
            entityId: entityId !== 'pending' ? entityId : undefined,
            isExpense: isReceiptUpload,
            tags: [],
            expenseType: isReceiptUpload ? 'material' as ExpenseType : undefined,
            amount: prefillData?.amount
          }
        });
        
        // Call the success callback if provided
        onSuccess?.(result.documentId);
      } else {
        toast({
          title: "Upload failed",
          description: result.error?.message || "There was an error uploading your document.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Document upload failed:", error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your document.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setProgressPercent(0);
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsUploading(false);
    setProgressPercent(0);
  };
  
  // Update entityId if it changes externally
  useEffect(() => {
    if (entityId && entityId !== 'pending') {
      form.setValue('metadata.entityId', entityId);
    }
  }, [entityId, form]);

  // Prefill data if available
  useEffect(() => {
    if (prefillData) {
      if (prefillData.amount) {
        form.setValue('metadata.amount', prefillData.amount);
      }
      
      if (prefillData.vendorId) {
        form.setValue('metadata.vendorId', prefillData.vendorId);
      }

      if (isReceiptUpload) {
        form.setValue('metadata.expenseType', 'material' as ExpenseType);
        
        if (prefillData.materialName) {
          form.setValue('metadata.notes', `Receipt for: ${prefillData.materialName}`);
        }
      }
    }
  }, [prefillData, form, isReceiptUpload]);

  return {
    form,
    isUploading,
    progressPercent,
    handleSubmit,
    handleCancel,
    handleFileChange
  };
};
