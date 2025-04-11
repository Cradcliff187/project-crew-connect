
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Upload, X, Loader2 } from 'lucide-react';
import { DocumentUploadSchema, DocumentUploadFormValues, EntityType, documentCategories, DocumentCategory } from './schemas/documentSchema';
import DropzoneUploader from './components/DropzoneUploader';
import { toast } from '@/hooks/use-toast';
import { uploadDocument } from '@/utils/documentUploader';

interface DocumentUploadProps {
  entityType: EntityType;
  entityId: string;
  onSuccess?: (documentId?: string) => void;
  onCancel?: () => void;
  isReceiptUpload?: boolean;
  prefillData?: {
    amount?: number;
    vendorId?: string;
    vendorType?: string;
    expenseType?: string;
    category?: string;
    notes?: string;
    tags?: string[];
    version?: number;
  };
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  entityType,
  entityId,
  onSuccess,
  onCancel,
  isReceiptUpload = false,
  prefillData
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  
  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(DocumentUploadSchema),
    defaultValues: {
      files: [],
      metadata: {
        entityType,
        entityId,
        category: prefillData?.category || (isReceiptUpload ? DocumentCategory.RECEIPT : ''),
        isExpense: isReceiptUpload,
        notes: prefillData?.notes || '',
        tags: prefillData?.tags || [],
        amount: prefillData?.amount,
        vendorId: prefillData?.vendorId,
        vendorType: prefillData?.vendorType,
        expenseType: prefillData?.expenseType,
        version: prefillData?.version || 1
      }
    }
  });
  
  const watchFiles = form.watch('files');
  
  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      form.setValue('files', files, { 
        shouldValidate: true, 
        shouldDirty: true, 
        shouldTouch: true 
      });
      
      if (files[0].type.includes('image')) {
        const objectUrl = URL.createObjectURL(files[0]);
        setPreviewURL(objectUrl);
      } else {
        setPreviewURL(null);
      }
    }
  };
  
  const onSubmit = async (data: DocumentUploadFormValues) => {
    if (isUploading) return;
    
    try {
      setIsUploading(true);
      
      const { entityType, entityId, category, isExpense } = data.metadata;
      
      console.log('Document upload metadata:', {
        entityType,
        entityId,
        category,
        isExpense: isExpense || false
      });
      
      const result = await uploadDocument(data.files[0], {
        entityType,
        entityId,
        category,
        isExpense: isExpense || false,
        amount: data.metadata.amount,
        expenseDate: data.metadata.expenseDate,
        vendorId: data.metadata.vendorId,
        vendorType: data.metadata.vendorType,
        expenseType: data.metadata.expenseType,
        budgetItemId: data.metadata.budgetItemId,
        parentEntityType: data.metadata.parentEntityType,
        parentEntityId: data.metadata.parentEntityId,
        tags: data.metadata.tags,
        notes: data.metadata.notes,
        version: data.metadata.version
      });
      
      if (!result.success) {
        throw result.error || new Error('Upload failed');
      }
      
      toast({
        title: isReceiptUpload ? "Receipt uploaded successfully" : "Document uploaded successfully",
        description: isReceiptUpload 
          ? "Your receipt has been attached." 
          : "Your document has been uploaded and indexed."
      });
      
      form.reset();
      
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
        setPreviewURL(null);
      }
      
      console.log('Document upload successful, documentId:', result.documentId);
      
      if (onSuccess) {
        onSuccess(result.documentId);
      }
      
    } catch (error: any) {
      console.error('Document upload failed:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your document.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card className="shadow-sm border-none">
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DropzoneUploader
              control={form.control}
              onFileSelect={handleFileSelect}
              previewURL={previewURL}
              watchFiles={watchFiles}
              label={isReceiptUpload ? 'Upload Receipt' : 'Upload Document'}
            />
            
            {form.formState.errors.files && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {form.formState.errors.files.message}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="metadata.category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value || ''}
                      disabled={isReceiptUpload}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {documentCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {(isReceiptUpload || form.watch('metadata.category') === 'receipt') && (
                <FormField
                  control={form.control}
                  name="metadata.amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter amount"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <FormField
              control={form.control}
              name="metadata.notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add notes about this document"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isUploading}
                className="bg-[#0485ea] hover:bg-[#0375d1]"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
