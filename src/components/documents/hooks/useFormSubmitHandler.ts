
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { uploadDocument } from '../services/DocumentUploader';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

export const useFormSubmitHandler = (
  form: UseFormReturn<DocumentUploadFormValues>,
  isUploading: boolean,
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>,
  onSuccess?: (documentId?: string) => void,
  previewURL: string | null = null
) => {
  // Memoize the submit handler to prevent recreation on each render
  const onSubmit = useCallback(async (data: DocumentUploadFormValues) => {
    if (isUploading) return; // Prevent multiple simultaneous submissions
    
    try {
      setIsUploading(true);
      
      // Only log in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log('Submitting document upload form', data);
      }
      
      const result = await uploadDocument(data);
      
      if (!result.success) {
        throw result.error || new Error('Upload failed');
      }
      
      const isReceiptUpload = data.metadata.category === 'receipt';
      
      toast({
        title: isReceiptUpload ? "Receipt uploaded successfully" : "Document uploaded successfully",
        description: isReceiptUpload 
          ? "Your receipt has been attached to this expense." 
          : "Your document has been uploaded and indexed."
      });
      
      // Reset form state
      form.reset();
      
      // Clean up preview URL if it exists
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
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
    }
  }, [form, isUploading, onSuccess, previewURL, setIsUploading]);

  return { onSubmit };
};
