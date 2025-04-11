
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
import { DocumentUploadSchema, DocumentUploadFormValues } from './schemas/documentSchema';
import DropzoneUploader from './components/DropzoneUploader';
import { documentService, EntityType } from '@/services/documentService';
import { toast } from '@/hooks/use-toast';

interface DocumentUploadProps {
  entityType: EntityType;
  entityId: string;
  onSuccess?: (documentId?: string) => void;
  onCancel?: () => void;
  isReceiptUpload?: boolean;
  prefillData?: {
    amount?: number;
    vendorId?: string;
    materialName?: string;
    expenseName?: string;
    category?: string;
    notes?: string;
    tags?: string[];
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
  
  // Initialize the form with react-hook-form
  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(DocumentUploadSchema),
    defaultValues: {
      files: [],
      metadata: {
        entityType,
        entityId,
        category: prefillData?.category || (isReceiptUpload ? 'receipt' : ''),
        isExpense: isReceiptUpload,
        notes: prefillData?.notes || '',
        tags: prefillData?.tags || [],
        amount: prefillData?.amount,
        vendorId: prefillData?.vendorId
      }
    }
  });
  
  // Get the selected file(s) from the form
  const watchFiles = form.watch('files');
  
  // Handle file selection
  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      // Update form value
      form.setValue('files', files, { 
        shouldValidate: true, 
        shouldDirty: true, 
        shouldTouch: true 
      });
      
      // Create preview URL for images
      if (files[0].type.includes('image')) {
        const objectUrl = URL.createObjectURL(files[0]);
        setPreviewURL(objectUrl);
      } else {
        setPreviewURL(null);
      }
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: DocumentUploadFormValues) => {
    if (isUploading) return;
    
    try {
      setIsUploading(true);
      
      // Get relevant form data for easier tracking in logs
      const { entityType, entityId, category, isExpense } = data.metadata;
      
      console.log('Document upload metadata:', {
        entityType,
        entityId,
        category,
        isExpense: isExpense || false
      });
      
      const result = await documentService.uploadDocument(data.files[0], data.metadata);
      
      if (!result.success) {
        throw result.error || new Error('Upload failed');
      }
      
      toast({
        title: isReceiptUpload ? "Receipt uploaded successfully" : "Document uploaded successfully",
        description: isReceiptUpload 
          ? "Your receipt has been attached." 
          : "Your document has been uploaded and indexed."
      });
      
      // Reset form state
      form.reset();
      
      // Clean up preview URL if it exists
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
        setPreviewURL(null);
      }
      
      console.log('Document upload successful, documentId:', result.documentId);
      
      // Call success callback with documentId
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
                      disabled={isReceiptUpload} // Disable if it's a receipt upload
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="receipt">Receipt</SelectItem>
                        <SelectItem value="invoice">Invoice</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="photo">Photo</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="specifications">Specifications</SelectItem>
                        <SelectItem value="permit">Permit</SelectItem>
                        <SelectItem value="certificate">Certificate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {(isReceiptUpload || form.watch('metadata.category') === 'receipt' || form.watch('metadata.category') === 'invoice') && (
                <FormField
                  control={form.control}
                  name="metadata.amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00"
                          step="0.01"
                          {...field}
                          value={field.value === null || field.value === undefined ? '' : field.value}
                          onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
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
                      placeholder={isReceiptUpload 
                        ? `Receipt for ${prefillData?.materialName || prefillData?.expenseName || 'purchase'}`
                        : "Add notes about this document"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2">
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={onCancel}
                  disabled={isUploading}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
              
              <Button 
                type="submit" 
                disabled={watchFiles.length === 0 || isUploading}
                className={isReceiptUpload 
                  ? "bg-[#0485ea] hover:bg-[#0375d1]" 
                  : undefined
                }
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {isReceiptUpload ? 'Upload Receipt' : 'Upload Document'}
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
