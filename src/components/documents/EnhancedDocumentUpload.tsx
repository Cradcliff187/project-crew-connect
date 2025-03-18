
import React, { useState } from 'react';
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
import { CalendarIcon, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DocumentCategorySelector from './DocumentCategorySelector';
import MobileDocumentCapture from './MobileDocumentCapture';
import ExpenseForm from './ExpenseForm';
import { cn } from '@/lib/utils';
import { 
  DocumentUploadFormValues, 
  documentUploadSchema, 
  EntityType 
} from './schemas/documentSchema';

interface EnhancedDocumentUploadProps {
  entityType: EntityType;
  entityId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EnhancedDocumentUpload: React.FC<EnhancedDocumentUploadProps> = ({
  entityType,
  entityId,
  onSuccess,
  onCancel
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('file');
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      files: [],
      metadata: {
        category: 'other',
        entityType: entityType,
        entityId: entityId || '',
        version: 1,
        tags: [],
        isExpense: false
      }
    }
  });

  const watchIsExpense = form.watch('metadata.isExpense');
  const watchFiles = form.watch('files');

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
      
      const { files, metadata } = data;
      const file = files[0]; // We're handling one file at a time for now
      
      // Create a unique file name using timestamp and original name
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${entityType.toLowerCase()}/${entityId || 'general'}/${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('construction_documents')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('construction_documents')
        .getPublicUrl(filePath);
        
      // Now insert document metadata to Supabase
      const { error: insertError } = await supabase
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
        });
        
      if (insertError) {
        throw insertError;
      }
      
      toast({
        title: "Document uploaded successfully",
        description: "Your document has been uploaded and indexed."
      });
      
      if (onSuccess) {
        onSuccess();
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Upload and categorize documents for your projects, invoices, and more.
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mx-6 grid grid-cols-2">
          <TabsTrigger value="file">File Upload</TabsTrigger>
          <TabsTrigger value="mobile">Mobile Capture</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 pt-4">
              <TabsContent value="file" className="space-y-4 mt-0">
                <FormField
                  control={form.control}
                  name="files"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document File</FormLabel>
                      <FormControl>
                        <div className="flex flex-col items-center justify-center w-full">
                          <label
                            htmlFor="dropzone-file"
                            className={cn(
                              "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100",
                              watchFiles.length > 0 ? "border-[#0485ea]" : "border-gray-300"
                            )}
                          >
                            {previewURL ? (
                              <div className="w-full h-full p-2 flex items-center justify-center">
                                <img
                                  src={previewURL}
                                  alt="Preview"
                                  className="max-h-full max-w-full object-contain"
                                />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">PDF, PNG, JPG, or other document formats</p>
                                {watchFiles.length > 0 && (
                                  <p className="mt-2 text-sm text-[#0485ea] font-medium">
                                    {watchFiles[0].name}
                                  </p>
                                )}
                              </div>
                            )}
                            <input
                              id="dropzone-file"
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                const files = e.target.files;
                                if (files && files.length > 0) {
                                  handleFileSelect([files[0]]);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="mobile" className="space-y-4 mt-0">
                <MobileDocumentCapture onCapture={handleMobileCapture} />
              </TabsContent>
              
              <Separator />
              
              <div className="space-y-4">
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
                
                {watchIsExpense && (
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
                          placeholder="Add any relevant notes about this document..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                {isUploading ? "Uploading..." : "Upload Document"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Tabs>
    </Card>
  );
};

export default EnhancedDocumentUpload;
