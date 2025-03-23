import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { uploadDocument } from '../services/DocumentUploader';
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

  // Initialize form with default values
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

  // Handle file selection and preview
  const handleFileSelect = (files: File[]) => {
    // CRITICAL FIX: Make sure we keep the actual File objects
    form.setValue('files', files);
    
    // Create preview URL for the first image if it's an image
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(files[0]);
      setPreviewURL(previewUrl);
    } else {
      setPreviewURL(null);
    }
  };

  // Handle form submission
  const onSubmit = async (data: DocumentUploadFormValues) => {
    try {
      setIsUploading(true);
      
      // CRITICAL FIX: Log the data being sent to ensure it contains actual File objects
      console.log('Submitting files:', data.files);
      
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
      
      // Reset form
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

  // Set up receipts category and expense type
  const initializeForm = () => {
    if (isReceiptUpload) {
      form.setValue('metadata.category', 'receipt');
      form.setValue('metadata.isExpense', true);
      form.setValue('metadata.expenseType', 'materials'); // Default value
      setShowVendorSelector(true);
    }
    
    // If prefill data is provided, use it
    if (prefillData) {
      if (prefillData.amount) {
        form.setValue('metadata.amount', prefillData.amount);
      }
      
      if (prefillData.vendorId) {
        form.setValue('metadata.vendorId', prefillData.vendorId);
      }
      
      // Handle either materialName or expenseName
      const itemName = prefillData.expenseName || prefillData.materialName;
      if (itemName) {
        // Add material/expense name as a tag and in notes
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
    watchIsExpense: form.watch('metadata.isExpense'),
    watchVendorType: form.watch('metadata.vendorType'),
    watchFiles: form.watch('files'),
    watchCategory: form.watch('metadata.category'),
    watchExpenseType: form.watch('metadata.expenseType')
  };
};
