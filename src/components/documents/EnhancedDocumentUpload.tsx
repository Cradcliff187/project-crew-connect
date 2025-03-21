
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { CalendarIcon, Upload, FolderOpen, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DocumentCategorySelector from './DocumentCategorySelector';
import MobileDocumentCapture from './MobileDocumentCapture';
import ExpenseForm from './ExpenseForm';
import VendorSelector from './VendorSelector';
import { cn } from '@/lib/utils';
import { FileUpload } from '@/components/ui/file-upload';
import { useIsMobile, useDeviceCapabilities } from '@/hooks/use-mobile';
import { 
  DocumentUploadFormValues, 
  documentUploadSchema, 
  EntityType 
} from './schemas/documentSchema';

interface EnhancedDocumentUploadProps {
  entityType: EntityType;
  entityId?: string;
  onSuccess?: (documentId?: string) => void;
  onCancel?: () => void;
  isReceiptUpload?: boolean;
  prefillData?: {
    amount?: number;
    vendorId?: string;
    materialName?: string;
  };
}

const EnhancedDocumentUpload: React.FC<EnhancedDocumentUploadProps> = ({
  entityType,
  entityId,
  onSuccess,
  onCancel,
  isReceiptUpload = false,
  prefillData
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('file');
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [showVendorSelector, setShowVendorSelector] = useState(false);
  const { isMobile, hasCamera } = useDeviceCapabilities();
  
  // Log props for debugging
  console.log('EnhancedDocumentUpload props:', { 
    entityType, 
    entityId, 
    isReceiptUpload, 
    prefillData 
  });

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
        vendorType: 'vendor'
      }
    }
  });

  // Pre-configure for receipt upload if needed
  useEffect(() => {
    if (isReceiptUpload) {
      form.setValue('metadata.category', 'receipt');
      form.setValue('metadata.isExpense', true);
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
      
      if (prefillData.materialName) {
        // Add material name as a tag and in notes
        form.setValue('metadata.tags', [prefillData.materialName]);
        form.setValue('metadata.notes', `Receipt for: ${prefillData.materialName}`);
      }
    }
  }, [isReceiptUpload, prefillData, form]);

  const watchIsExpense = form.watch('metadata.isExpense');
  const watchVendorType = form.watch('metadata.vendorType');
  const watchFiles = form.watch('files');
  const watchCategory = form.watch('metadata.category');

  // Auto-show vendor selector when receipt category is selected
  useEffect(() => {
    if (watchCategory === 'receipt' || watchCategory === 'invoice') {
      setShowVendorSelector(true);
    }
  }, [watchCategory]);

  const handleFileSelect = (files: File[]) => {
    form.setValue('files', files);
    
    // Create preview URL for the first image if it's an image
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(files[0]);
      setPreviewURL(previewUrl);
    } else {
      setPreviewURL(null);
    }
  };

  const handleMobileCapture = (file: File) => {
    handleFileSelect([file]);
    setActiveTab('file');
  };

  const onSubmit = async (data: DocumentUploadFormValues) => {
    try {
      setIsUploading(true);
      console.log('Uploading document with data:', data);
      
      let uploadedDocumentId: string | undefined;
      
      const { files, metadata } = data;
      
      // We'll handle multiple files if they're provided
      for (const file of files) {
        // Create a unique file name using timestamp and original name
        const timestamp = new Date().getTime();
        const fileExt = file.name.split('.').pop();
        const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `${entityType.toLowerCase()}/${entityId || 'general'}/${fileName}`;
        
        // IMPORTANT: Using the correct bucket name in snake_case format
        const bucketName = 'construction_documents';
        
        console.log(`Uploading file to ${bucketName} bucket, path: ${filePath}`);
        
        // Upload file to Supabase Storage
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file);
          
        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw uploadError;
        }
        
        console.log('File uploaded successfully:', uploadData);
        
        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
          
        console.log('Public URL generated:', publicUrl);
        
        // Now insert document metadata to Supabase
        const { data: insertedData, error: insertError } = await supabase
          .from('documents')
          .insert({
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: filePath,
            entity_type: metadata.entityType,
            entity_id: metadata.entityId || null,
            tags: metadata.tags,
            // Additional metadata fields
            category: metadata.category,
            amount: metadata.amount,
            expense_date: metadata.expenseDate ? metadata.expenseDate.toISOString() : null,
            version: metadata.version,
            is_expense: metadata.isExpense,
            notes: metadata.notes,
            vendor_id: metadata.vendorId || null,
            vendor_type: metadata.vendorType || null,
          })
          .select('document_id')
          .single();
          
        if (insertError) {
          console.error('Document metadata insert error:', insertError);
          throw insertError;
        }
        
        console.log('Document metadata inserted:', insertedData);
        
        // Store the document ID for the first file
        if (insertedData) {
          uploadedDocumentId = insertedData.document_id;
        }
      }
      
      toast({
        title: isReceiptUpload ? "Receipt uploaded successfully" : "Document uploaded successfully",
        description: isReceiptUpload 
          ? "Your receipt has been attached to this material." 
          : "Your document has been uploaded and indexed."
      });
      
      if (onSuccess) {
        console.log('Calling onSuccess with document ID:', uploadedDocumentId);
        onSuccess(uploadedDocumentId);
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

  // If prefill data is available and it's a receipt upload, simplify the UI
  const simplifiedUpload = isReceiptUpload && prefillData;

  // The main file upload component - always visible regardless of device type
  const FileUploadSection = () => (
    <FormField
      control={form.control}
      name="files"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Upload Receipt</FormLabel>
          <FormControl>
            <div className={cn(
              "flex flex-col items-center justify-center w-full",
              isReceiptUpload ? "mt-2" : ""
            )}>
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100",
                  watchFiles.length > 0 ? "border-[#0485ea]" : "border-gray-300"
                )}
                onClick={() => document.getElementById('dropzone-file')?.click()}
              >
                {previewURL ? (
                  <div className="w-full h-full p-2 flex flex-col items-center justify-center">
                    <img
                      src={previewURL}
                      alt="Preview"
                      className="max-h-36 max-w-full object-contain mb-2"
                    />
                    <p className="text-sm text-[#0485ea] font-medium">
                      {watchFiles[0]?.name}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-[#0485ea]" />
                    <p className="mb-2 text-sm">
                      <span className="font-semibold text-[#0485ea]">Drag and drop</span> your receipt here
                    </p>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      className="mt-2 border-[#0485ea] text-[#0485ea]"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById('dropzone-file')?.click();
                      }}
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                    {watchFiles.length > 0 && (
                      <p className="mt-2 text-sm text-[#0485ea] font-medium">
                        {watchFiles.length > 1 
                          ? `${watchFiles.length} files selected` 
                          : watchFiles[0].name}
                      </p>
                    )}
                  </div>
                )}
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  multiple={false}
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      handleFileSelect(Array.from(files));
                    }
                  }}
                />
              </div>
              
              {watchFiles.length > 0 && (
                <div className="w-full mt-2">
                  <p className="text-sm text-[#0485ea] font-medium text-center">
                    {watchFiles.length} file(s) selected
                  </p>
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Card className="w-full">
      {!simplifiedUpload && (
        <CardHeader>
          <CardTitle>{isReceiptUpload ? "Upload Receipt" : "Upload Document"}</CardTitle>
          <CardDescription>
            {isReceiptUpload 
              ? "Upload receipts for materials or expenses related to this work order."
              : "Upload and categorize documents for your projects, invoices, and more."}
          </CardDescription>
        </CardHeader>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-4">
            {/* Always show file upload section, regardless of device type */}
            <FileUploadSection />
            
            {isMobile && hasCamera && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setActiveTab('mobile')}
                className="w-full flex items-center justify-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Take Photo Instead
              </Button>
            )}
            
            {activeTab === 'mobile' && isMobile && hasCamera && (
              <MobileDocumentCapture onCapture={handleMobileCapture} />
            )}
            
            {!simplifiedUpload && <Separator />}
            
            {!simplifiedUpload && (
              <div className="space-y-4">
                {!isReceiptUpload && (
                  <FormField
                    control={form.control}
                    name="metadata.category"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Document Category</FormLabel>
                        <FormControl>
                          <DocumentCategorySelector
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {!isReceiptUpload && (
                  <FormField
                    control={form.control}
                    name="metadata.isExpense"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Expense Document
                          </FormLabel>
                          <FormDescription>
                            Mark this document as an expense record (invoice, receipt, etc.)
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
                
                {/* Only show vendor selector if not using prefilled data */}
                {showVendorSelector && !prefillData?.vendorId && (
                  <VendorSelector 
                    control={form.control} 
                    watchVendorType={watchVendorType} 
                  />
                )}
                
                {(watchIsExpense || isReceiptUpload) && !prefillData?.amount && (
                  <ExpenseForm control={form.control} />
                )}
                
                <FormField
                  control={form.control}
                  name="metadata.notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={isReceiptUpload 
                            ? "Add any details about this receipt..." 
                            : "Add any relevant notes about this document..."}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit" 
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              disabled={isUploading || watchFiles.length === 0}
            >
              {isUploading ? "Uploading..." : (isReceiptUpload ? "Upload Receipt" : "Upload Document")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default EnhancedDocumentUpload;
