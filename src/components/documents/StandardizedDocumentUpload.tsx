import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDeviceCapabilities } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EntityType } from '@/types/common';
import DropzoneUploader from './components/DropzoneUploader';
import StandardizedMetadataForm from './components/StandardizedMetadataForm';
import MobileCaptureWrapper from './components/MobileCaptureWrapper';
import VendorSelectDialog from '@/components/vendors/VendorSelectDialog';

// Define schema for document upload
const documentUploadSchema = z.object({
  files: z.array(z.any()).min(1, { message: 'At least one file is required' }),
  metadata: z.object({
    entityType: z.enum(
      ['PROJECT', 'ESTIMATE', 'WORK_ORDER', 'VENDOR', 'SUBCONTRACTOR', 'TIME_ENTRY', 'EMPLOYEE'],
      {
        errorMap: () => ({ message: 'Please select a valid entity type' }),
      }
    ),
    entityId: z.string().min(1, { message: 'Entity ID is required' }),
    category: z.string().min(1, { message: 'Category is required' }),
    isExpense: z.boolean().optional().default(false),
    tags: z.array(z.string()).optional().default([]),
    notes: z.string().optional(),
    vendorId: z.string().optional(),
    vendorName: z.string().optional(),
    vendorType: z.string().optional(),
    expenseType: z.string().optional(),
    amount: z.number().optional(),
    expenseDate: z.union([z.date(), z.string()]).optional(),
    budgetItemId: z.string().optional(),
    parentEntityType: z.string().optional(),
    parentEntityId: z.string().optional(),
  }),
});

type DocumentUploadFormValues = z.infer<typeof documentUploadSchema>;

interface StandardizedDocumentUploadProps {
  entityType: EntityType;
  entityId: string;
  onSuccess?: (documentId?: string) => void;
  onCancel?: () => void;
  isReceiptUpload?: boolean;
  prefillData?: {
    amount?: number;
    vendorId?: string;
    vendorName?: string;
    materialName?: string;
    expenseName?: string;
    notes?: string;
    category?: string;
    tags?: string[];
    budgetItemId?: string;
    parentEntityType?: string;
    parentEntityId?: string;
    expenseType?: string;
    expenseDate?: Date | string;
  };
  preventFormPropagation?: boolean;
  allowEntityTypeSelection?: boolean;
  onEntityTypeChange?: (entityType: EntityType) => void;
}

const StandardizedDocumentUpload: React.FC<StandardizedDocumentUploadProps> = ({
  entityType,
  entityId,
  onSuccess,
  onCancel,
  isReceiptUpload = false,
  prefillData,
  preventFormPropagation = false,
  allowEntityTypeSelection = false,
  onEntityTypeChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [showMobileCapture, setShowMobileCapture] = useState(false);
  const [showVendorSelector, setShowVendorSelector] = useState(false);
  const { isMobile, hasCamera } = useDeviceCapabilities();

  // Initialize form
  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      files: [],
      metadata: {
        entityType: entityType,
        entityId: entityId,
        category: isReceiptUpload ? 'receipt' : prefillData?.category || 'other',
        isExpense: isReceiptUpload || ['receipt', 'invoice'].includes(prefillData?.category || ''),
        tags: prefillData?.tags || [],
      },
    },
  });

  // Watch important form values
  const watchCategory = form.watch('metadata.category');
  const watchEntityType = form.watch('metadata.entityType');
  const watchIsExpense = form.watch('metadata.isExpense');
  const watchFiles = form.watch('files');

  // Handle file selection
  const handleFileSelect = useCallback(
    (files: File[]) => {
      form.setValue('files', files);

      // Create preview URL for the first file if it's an image
      if (files.length > 0 && files[0].type.startsWith('image/')) {
        const url = URL.createObjectURL(files[0]);
        setPreviewURL(url);
      } else {
        setPreviewURL(null);
      }
    },
    [form]
  );

  // Handle mobile camera capture
  const handleMobileCapture = useCallback(
    (file: File) => {
      handleFileSelect([file]);
      setShowMobileCapture(false);
    },
    [handleFileSelect]
  );

  // Handle vendor selection
  const handleVendorSelect = useCallback(
    (vendor: any) => {
      form.setValue('metadata.vendorId', vendor.id);
      form.setValue('metadata.vendorName', vendor.name);
      form.setValue('metadata.vendorType', 'vendor');
      setShowVendorSelector(false);
    },
    [form]
  );

  // Upload document to Supabase
  const uploadDocument = async (
    data: DocumentUploadFormValues
  ): Promise<{ success: boolean; documentId?: string; error?: any }> => {
    try {
      const file = data.files[0]; // Currently only handling single files
      const metadata = data.metadata;

      // Generate unique filename
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(2, 10);
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${randomString}.${fileExt}`;

      // Create storage path based on entity type and ID
      const entityTypePath = metadata.entityType.toLowerCase().replace('_', '-');
      const entityIdPath = metadata.entityId || 'general';
      const filePath = `${entityTypePath}/${entityIdPath}/${fileName}`;

      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('construction_documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { success: false, error: uploadError };
      }

      // Format the expense date if provided
      let expenseDate = null;
      if (metadata.expenseDate) {
        expenseDate =
          metadata.expenseDate instanceof Date
            ? metadata.expenseDate.toISOString()
            : new Date(metadata.expenseDate).toISOString();
      }

      // Prepare document data for database
      const docData = {
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: filePath,
        entity_type: metadata.entityType,
        entity_id: metadata.entityId,
        category: metadata.category,
        amount: metadata.amount,
        expense_date: expenseDate,
        expense_type: metadata.expenseType,
        vendor_id: metadata.vendorId,
        vendor_type: metadata.vendorType,
        is_expense: metadata.isExpense,
        notes: metadata.notes,
        tags: metadata.tags || [],
        budget_item_id: metadata.budgetItemId,
        version: 1,
        is_latest_version: true,
      };

      // Insert document record
      const { data: insertedDoc, error: documentError } = await supabase
        .from('documents')
        .insert(docData)
        .select()
        .single();

      if (documentError) {
        console.error('Document insert error:', documentError);
        // Try to delete uploaded file on error
        await supabase.storage.from('construction_documents').remove([filePath]);
        return { success: false, error: documentError };
      }

      // Create parent entity relationship if applicable
      if (metadata.parentEntityType && metadata.parentEntityId) {
        await supabase.from('document_relationships').insert({
          source_document_id: insertedDoc.document_id,
          target_document_id: null,
          relationship_type: 'PARENT_ENTITY',
          relationship_metadata: {
            parent_entity_type: metadata.parentEntityType,
            parent_entity_id: metadata.parentEntityId,
            description: 'Document belongs to this parent entity',
          },
        });
      }

      return {
        success: true,
        documentId: insertedDoc.document_id,
      };
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error };
    }
  };

  // Handle form submission
  const onSubmit = async (data: DocumentUploadFormValues) => {
    try {
      setIsUploading(true);

      // Upload document
      const result = await uploadDocument(data);

      if (!result.success) {
        throw new Error(result.error?.message || 'Upload failed');
      }

      // Show success message
      toast({
        title: isReceiptUpload ? 'Receipt uploaded successfully' : 'Document uploaded successfully',
        description: `${data.files[0].name} has been uploaded.`,
        variant: 'default',
      });

      // Clean up preview URL
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }

      // Reset form
      form.reset();

      // Call success callback
      if (onSuccess) {
        onSuccess(result.documentId);
      }
    } catch (error: any) {
      console.error('Document upload failed:', error);

      toast({
        title: 'Upload failed',
        description: error.message || 'There was an error uploading your document.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission with propagation prevention
  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      if (preventFormPropagation) {
        e.stopPropagation();
      }
      form.handleSubmit(onSubmit)(e);
    },
    [form, onSubmit, preventFormPropagation]
  );

  // Handle cancel button
  const handleCancel = useCallback(() => {
    // Clean up preview URL
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
    }

    // Reset form
    form.reset();

    // Call cancel callback
    if (onCancel) {
      onCancel();
    }
  }, [form, onCancel, previewURL]);

  // Initialize form with prefill data
  useEffect(() => {
    // Set entity info
    form.setValue('metadata.entityType', entityType);
    form.setValue('metadata.entityId', entityId);

    // Set category based on receipt upload flag or prefill data
    const category = isReceiptUpload ? 'receipt' : prefillData?.category || 'other';
    form.setValue('metadata.category', category);

    // Set expense flag based on category or receipt flag
    const isExpense = isReceiptUpload || ['receipt', 'invoice'].includes(category);
    form.setValue('metadata.isExpense', isExpense);

    // Set prefill data if available
    if (prefillData) {
      if (prefillData.amount !== undefined) {
        form.setValue('metadata.amount', prefillData.amount);
      }

      if (prefillData.vendorId) {
        form.setValue('metadata.vendorId', prefillData.vendorId);
        form.setValue('metadata.vendorName', prefillData.vendorName || '');
        form.setValue('metadata.vendorType', 'vendor');
      }

      if (prefillData.notes) {
        form.setValue('metadata.notes', prefillData.notes);
      }

      if (prefillData.tags && prefillData.tags.length > 0) {
        form.setValue('metadata.tags', prefillData.tags);
      }

      if (prefillData.budgetItemId) {
        form.setValue('metadata.budgetItemId', prefillData.budgetItemId);
      }

      if (prefillData.parentEntityType && prefillData.parentEntityId) {
        form.setValue('metadata.parentEntityType', prefillData.parentEntityType);
        form.setValue('metadata.parentEntityId', prefillData.parentEntityId);
      }

      if (prefillData.expenseType) {
        form.setValue('metadata.expenseType', prefillData.expenseType);
      }

      if (prefillData.expenseDate) {
        form.setValue('metadata.expenseDate', prefillData.expenseDate);
      }
    }
  }, [form, entityType, entityId, isReceiptUpload, prefillData]);

  // Notify parent of entity type changes
  useEffect(() => {
    if (onEntityTypeChange && watchEntityType) {
      onEntityTypeChange(watchEntityType as EntityType);
    }
  }, [watchEntityType, onEntityTypeChange]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [previewURL]);

  // Get appropriate title based on context
  const getTitle = () => {
    if (isReceiptUpload) return 'Upload Receipt';

    switch (watchEntityType) {
      case 'VENDOR':
        return 'Upload Vendor Document';
      case 'SUBCONTRACTOR':
        return 'Upload Subcontractor Document';
      case 'PROJECT':
        return 'Upload Project Document';
      case 'ESTIMATE':
        return 'Upload Estimate Document';
      case 'WORK_ORDER':
        return 'Upload Work Order Document';
      case 'TIME_ENTRY':
        return 'Upload Time Entry Document';
      default:
        return 'Upload Document';
    }
  };

  // Get appropriate description based on context
  const getDescription = () => {
    if (isReceiptUpload) {
      return 'Upload receipts for expenses related to this work order or project.';
    }

    switch (watchEntityType) {
      case 'VENDOR':
        return 'Upload documents related to this vendor such as certifications or contracts.';
      case 'SUBCONTRACTOR':
        return 'Upload documents related to this subcontractor such as insurance, certifications or contracts.';
      case 'PROJECT':
        return 'Upload documents for this project such as photos, contracts or specifications.';
      case 'ESTIMATE':
        return 'Upload documents for this estimate such as quotes, proposals or specifications.';
      case 'WORK_ORDER':
        return 'Upload documents for this work order such as receipts, photos or contracts.';
      case 'TIME_ENTRY':
        return 'Upload receipts or timesheets for this time entry.';
      default:
        return 'Upload and categorize documents for your projects, invoices, and more.';
    }
  };

  // Check if this is a simplified upload (for receipts with prefilled data)
  const simplifiedUpload = isReceiptUpload && prefillData;

  return (
    <Card
      className="w-full"
      onClick={preventFormPropagation ? e => e.stopPropagation() : undefined}
    >
      {!simplifiedUpload && (
        <CardHeader>
          <CardTitle>{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
      )}

      <Form {...form}>
        <form onSubmit={handleFormSubmit}>
          <CardContent className="p-0">
            <ScrollArea className="h-[60vh] px-6 py-4 md:max-h-[500px]">
              <div className="space-y-6">
                {/* File Uploader Component */}
                <DropzoneUploader
                  control={form.control}
                  onFileSelect={handleFileSelect}
                  previewURL={previewURL}
                  watchFiles={watchFiles}
                  label={getTitle()}
                />

                {/* Mobile Capture Component */}
                {isMobile && hasCamera && (
                  <MobileCaptureWrapper
                    onCapture={handleMobileCapture}
                    isMobile={isMobile}
                    hasCamera={hasCamera}
                    showMobileCapture={showMobileCapture}
                    setShowMobileCapture={setShowMobileCapture}
                  />
                )}

                {/* Metadata Form Component */}
                <StandardizedMetadataForm
                  form={form}
                  entityType={watchEntityType as EntityType}
                  category={watchCategory}
                  isExpense={watchIsExpense}
                  isReceiptUpload={isReceiptUpload}
                  prefillData={prefillData}
                  allowEntityTypeSelection={allowEntityTypeSelection}
                />
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="flex justify-between mt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCancel();
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              disabled={isUploading || watchFiles.length === 0}
              onClick={preventFormPropagation ? e => e.stopPropagation() : undefined}
            >
              {isUploading
                ? 'Uploading...'
                : isReceiptUpload
                  ? 'Upload Receipt'
                  : `Upload ${watchCategory || 'Document'}`}
            </Button>
          </CardFooter>
        </form>
      </Form>

      {/* Vendor Selector Dialog */}
      <VendorSelectDialog
        open={showVendorSelector}
        onOpenChange={open => {
          // Safely update state and prevent potential bubbling issues
          setShowVendorSelector(open);
        }}
        onVendorSelected={handleVendorSelect}
      />
    </Card>
  );
};

export default StandardizedDocumentUpload;
