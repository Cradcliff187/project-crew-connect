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
import { EntityType, DocumentCategory } from '@/types/common';
import { PrefillData } from './types/documentTypes';
import DropzoneUploader from './components/DropzoneUploader';
import StandardizedMetadataForm from './components/StandardizedMetadataForm';
import MobileCaptureWrapper from './components/MobileCaptureWrapper';
import VendorSelectDialog from '@/components/vendors/VendorSelectDialog';
import { documentCategories } from './schemas/documentSchema';

const allowedCategories = documentCategories as unknown as [string, ...string[]];

const documentUploadSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, { message: 'At least one file is required' }),
  metadata: z.object({
    entityType: z.enum([
      'PROJECT', 'ESTIMATE', 'WORK_ORDER', 'VENDOR', 'SUBCONTRACTOR', 
      'TIME_ENTRY', 'EMPLOYEE', 'CONTACT', 'CUSTOMER', 'EXPENSE', 'ESTIMATE_ITEM'
    ] as const, {
      errorMap: () => ({ message: 'Please select a valid entity type' }),
    }),
    entityId: z.string().min(1, { message: 'Entity ID is required' }),
    category: z.enum(allowedCategories, { 
      message: 'Please select a valid document category' 
    }),
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
    version: z.number().optional().default(1),
  }),
});

type DocumentUploadFormValues = z.infer<typeof documentUploadSchema>;

interface StandardizedDocumentUploadProps {
  entityType: EntityType;
  entityId: string;
  onSuccess?: (documentId?: string) => void;
  onCancel?: () => void;
  isReceiptUpload?: boolean;
  prefillData?: PrefillData;
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

  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      files: [],
      metadata: {
        entityType: entityType,
        entityId: entityId,
        category: (isReceiptUpload ? 'receipt' : (prefillData?.category || 'other')) as DocumentCategory,
        isExpense: isReceiptUpload || prefillData?.isExpense || prefillData?.is_expense || ['receipt', 'invoice'].includes(prefillData?.category || ''),
        tags: prefillData?.tags || [],
        version: 1,
      },
    },
  });

  const watchCategory = form.watch('metadata.category');
  const watchEntityType = form.watch('metadata.entityType');
  const watchIsExpense = form.watch('metadata.isExpense');
  const watchFiles = form.watch('files');

  const handleFileSelect = useCallback(
    (files: File[]) => {
      form.setValue('files', files);

      if (files.length > 0 && files[0].type.startsWith('image/')) {
        const url = URL.createObjectURL(files[0]);
        setPreviewURL(url);
      } else {
        setPreviewURL(null);
      }
    },
    [form]
  );

  const handleMobileCapture = useCallback(
    (file: File) => {
      handleFileSelect([file]);
      setShowMobileCapture(false);
    },
    [handleFileSelect]
  );

  const handleVendorSelect = useCallback(
    (vendor: any) => {
      form.setValue('metadata.vendorId', vendor.id);
      form.setValue('metadata.vendorName', vendor.name);
      form.setValue('metadata.vendorType', 'vendor');
      setShowVendorSelector(false);
    },
    [form]
  );

  const uploadDocument = async (
    data: DocumentUploadFormValues
  ): Promise<{ success: boolean; documentId?: string; error?: any }> => {
    try {
      const file = data.files[0];
      const metadata = data.metadata;

      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(2, 10);
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${randomString}.${fileExt}`;

      const entityTypePath = metadata.entityType.toLowerCase().replace('_', '-');
      const entityIdPath = metadata.entityId || 'general';
      const filePath = `${entityTypePath}/${entityIdPath}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('construction_documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { success: false, error: uploadError };
      }

      let expenseDate = null;
      if (metadata.expenseDate) {
        expenseDate =
          metadata.expenseDate instanceof Date
            ? metadata.expenseDate.toISOString()
            : new Date(metadata.expenseDate).toISOString();
      }

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

      const { data: insertedDoc, error: documentError } = await supabase
        .from('documents')
        .insert(docData)
        .select()
        .single();

      if (documentError) {
        console.error('Document insert error:', documentError);
        await supabase.storage.from('construction_documents').remove([filePath]);
        return { success: false, error: documentError };
      }

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

  const onSubmit = async (data: DocumentUploadFormValues) => {
    try {
      setIsUploading(true);

      const result = await uploadDocument(data);

      if (!result.success) {
        throw new Error(result.error?.message || 'Upload failed');
      }

      toast({
        title: isReceiptUpload ? 'Receipt uploaded successfully' : 'Document uploaded successfully',
        description: `${data.files[0].name} has been uploaded.`,
        variant: 'default',
      });

      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }

      form.reset();

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

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      if (preventFormPropagation) {
        e.stopPropagation();
      }
      form.handleSubmit(onSubmit)(e);
    },
    [form, onSubmit, preventFormPropagation]
  );

  const handleCancel = useCallback(() => {
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
    }

    form.reset();

    if (onCancel) {
      onCancel();
    }
  }, [form, onCancel, previewURL]);

  useEffect(() => {
    form.setValue('metadata.entityType', entityType);
    form.setValue('metadata.entityId', entityId);

    const category = isReceiptUpload ? 'receipt' : (prefillData?.category || 'other');
    form.setValue('metadata.category', category as DocumentCategory);

    const isExpense = isReceiptUpload || prefillData?.isExpense || prefillData?.is_expense || ['receipt', 'invoice'].includes(category);
    form.setValue('metadata.isExpense', isExpense);

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

  useEffect(() => {
    if (onEntityTypeChange && watchEntityType) {
      onEntityTypeChange(watchEntityType as EntityType);
    }
  }, [watchEntityType, onEntityTypeChange]);

  useEffect(() => {
    return () => {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [previewURL]);

  const getTitle = () => {
    if (isReceiptUpload) return 'Upload Receipt';

    switch (form.watch('metadata.entityType')) {
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

  const getDescription = () => {
    if (isReceiptUpload) {
      return 'Upload receipts for expenses related to this work order or project.';
    }

    switch (form.watch('metadata.entityType')) {
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
                <DropzoneUploader
                  control={form.control}
                  onFileSelect={handleFileSelect}
                  previewURL={previewURL}
                  watchFiles={watchFiles}
                  label={getTitle()}
                />

                {isMobile && hasCamera && (
                  <MobileCaptureWrapper
                    onCapture={handleMobileCapture}
                    isMobile={isMobile}
                    hasCamera={hasCamera}
                    showMobileCapture={showMobileCapture}
                    setShowMobileCapture={setShowMobileCapture}
                  />
                )}

                <StandardizedMetadataForm
                  form={form}
                  entityType={form.watch('metadata.entityType') as EntityType}
                  category={form.watch('metadata.category')}
                  isExpense={form.watch('metadata.isExpense')}
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
                  : `Upload ${form.watch('metadata.category') || 'Document'}`}
            </Button>
          </CardFooter>
        </form>
      </Form>

      <VendorSelectDialog
        open={showVendorSelector}
        onOpenChange={open => {
          setShowVendorSelector(open);
        }}
        onVendorSelected={handleVendorSelect}
      />
    </Card>
  );
};

export default StandardizedDocumentUpload;
