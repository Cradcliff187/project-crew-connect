
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

export const useFileSelectionHandling = (
  form: UseFormReturn<DocumentUploadFormValues>,
  setPreviewURL: React.Dispatch<React.SetStateAction<string | null>>
) => {
  // Memoize the file selection handler to prevent recreating on each render
  const handleFileSelect = useCallback((files: File[]) => {
    if (!files.length) return;
    
    // Update the form value
    form.setValue('files', files, { shouldValidate: true });
    
    // Create a preview URL for images
    if (files[0].type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(files[0]);
      setPreviewURL(previewUrl);
    } else {
      setPreviewURL(null);
    }
  }, [form, setPreviewURL]);

  return { handleFileSelect };
};
