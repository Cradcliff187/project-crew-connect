
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { documentUploadSchema, DocumentUploadFormValues, EntityType } from './schemas/documentSchema';
import { documentService } from '@/services/documentService';
import { useFormInitialization } from './hooks/useFormInitialization';

// Import components
import FileUploadField from './components/FileUploadField';
import DocumentMetadataFields from './components/DocumentMetadataFields';
import DocumentCategorySelector from './components/DocumentCategorySelector';
import TagsField from './components/TagsField';
import ExpenseDatePicker from './components/ExpenseDatePicker';
import ExpenseAmountField from './components/ExpenseAmountField';
import VendorSelector from './components/VendorSelector';
import EntitySelector from './components/EntitySelector';

export interface EnhancedDocumentUploadProps {
  entityType: EntityType;
  entityId: string;
  onSuccess?: (documentId?: string) => void;
  onCancel?: () => void;
  onError?: (error: Error) => void;
  isReceiptUpload?: boolean;
  preventFormPropagation?: boolean;
  prefillData?: {
    amount?: number;
    vendorId?: string;
    materialName?: string;
    expenseName?: string;
    budgetItemId?: string;
    parentEntityType?: string;
    parentEntityId?: string;
    tags?: string[];
  };
  allowEntityTypeSelection?: boolean;
}

/**
 * Enhanced document upload component with metadata, category selection, and more
 */
const EnhancedDocumentUpload: React.FC<EnhancedDocumentUploadProps> = ({
  entityType,
  entityId,
  onSuccess,
  onCancel,
  onError,
  isReceiptUpload = false,
  preventFormPropagation = false,
  prefillData,
  allowEntityTypeSelection = false
}) => {
  const { toast } = useToast();

  // Initialize form with react-hook-form and zod validation
  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    mode: 'onChange',
    defaultValues: {
      files: [],
      metadata: {
        entityType: entityType,
        entityId: entityId,
        isExpense: isReceiptUpload,
        category: isReceiptUpload ? 'receipt' : undefined,
        tags: []
      }
    }
  });
  
  // Use our custom hook to initialize the form with the correct values
  const { initializeForm } = useFormInitialization({
    form,
    entityType,
    entityId,
    isReceiptUpload,
    prefillData
  });

  // Initialize the form when props change
  useEffect(() => {
    initializeForm();
  }, [entityType, entityId, isReceiptUpload, prefillData, initializeForm]);

  // Derived state
  const files = form.watch('files');
  const isExpense = form.watch('metadata.isExpense');
  const vendorType = form.watch('metadata.vendorType');
  const isSubmitting = form.formState.isSubmitting;
  const isValid = files.length > 0;

  // Handle form submission
  const handleSubmit = async (data: DocumentUploadFormValues) => {
    if (data.files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload",
        variant: "destructive"
      });
      return;
    }

    try {
      // Upload the first file (we'll enhance this for multi-file support later)
      const file = data.files[0];

      // Determine expense type based on metadata
      let expenseType = data.metadata.expenseType;
      
      // If this is a material receipt, default to 'material'
      if (isReceiptUpload && prefillData?.materialName) {
        expenseType = 'materials';
      }

      // Create metadata for document service
      const uploadMetadata = {
        entityType: data.metadata.entityType,
        entityId: data.metadata.entityId,
        category: data.metadata.category,
        isExpense: isExpense,
        amount: data.metadata.amount,
        expenseDate: data.metadata.expenseDate,
        vendorId: data.metadata.vendorId,
        vendorType: data.metadata.vendorType,
        expenseType: expenseType,
        budgetItemId: prefillData?.budgetItemId,
        tags: data.metadata.tags,
        notes: data.metadata.notes,
        version: data.metadata.version,
        parentEntityType: prefillData?.parentEntityType,
        parentEntityId: prefillData?.parentEntityId
      };

      // Upload document using the document service
      const result = await documentService.uploadDocument(file, uploadMetadata);

      if (!result.success) {
        throw new Error(result.message || 'Failed to upload document');
      }

      toast({
        title: "Document uploaded",
        description: "Document was uploaded successfully"
      });

      // Call success callback with the document ID
      if (onSuccess) {
        onSuccess(result.documentId);
      }
    } catch (error: any) {
      console.error('Document upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "An unexpected error occurred during upload",
        variant: "destructive"
      });

      if (onError) {
        onError(error);
      }
    }
  };

  // Prevent event propagation if needed (for nested forms)
  const handleFormClick = (e: React.MouseEvent) => {
    if (preventFormPropagation) {
      e.stopPropagation();
    }
  };

  return (
    <Card className="border shadow-sm">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
          onClick={handleFormClick}
        >
          <CardContent className="space-y-4 pt-6">
            <FileUploadField
              control={form.control}
              name="files"
              maxFiles={1}
              acceptedFileTypes={{
                'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
                'application/pdf': ['.pdf'],
                'application/msword': ['.doc'],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                'text/plain': ['.txt'],
                'application/vnd.ms-excel': ['.xls'],
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
              }}
              maxSize={15 * 1024 * 1024} // 15MB
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DocumentCategorySelector
                control={form.control}
                isReceiptUpload={isReceiptUpload}
              />

              <div className="space-y-4">
                {allowEntityTypeSelection && (
                  <EntitySelector
                    control={form.control}
                    isReceiptUpload={isReceiptUpload}
                  />
                )}
                
                <DocumentMetadataFields
                  control={form.control}
                  isExpense={isExpense}
                  materialName={prefillData?.materialName}
                  expenseName={prefillData?.expenseName}
                />

                {isExpense && (
                  <>
                    <ExpenseDatePicker control={form.control} />
                    <ExpenseAmountField
                      control={form.control}
                      amount={prefillData?.amount}
                    />
                  </>
                )}
              </div>
            </div>

            {isExpense && vendorType && (
              <VendorSelector
                control={form.control}
                vendorType={vendorType}
                prefillVendorId={prefillData?.vendorId}
              />
            )}

            <TagsField
              control={form.control}
            />
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="bg-[#0485ea] hover:bg-[#0375d1]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Document'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default EnhancedDocumentUpload;
