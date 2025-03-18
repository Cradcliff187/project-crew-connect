
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { Loader2, CheckCircle } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentCategorySelector } from './DocumentCategorySelector';
import { DocumentMetadata, DocumentUploadFormValues, documentUploadSchema, EntityType } from './schemas/documentSchema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MobileDocumentCapture from './MobileDocumentCapture';
import ExpenseForm from './ExpenseForm';

interface EnhancedDocumentUploadProps {
  projectId?: string;
  workOrderId?: string;
  entityType?: EntityType;
  entityId?: string;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export default function EnhancedDocumentUpload({
  projectId,
  workOrderId,
  entityType = "PROJECT",
  entityId,
  onSuccess,
  onCancel
}: EnhancedDocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("document");

  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      files: [],
      metadata: {
        category: 'other',
        entityType: entityType,
        entityId: entityId || projectId || workOrderId || '',
        version: 1,
        tags: [],
        isExpense: false
      }
    },
  });

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
    form.setValue('files', newFiles);
  };

  const handleFileClear = (fileIndex: number) => {
    const updatedFiles = files.filter((_, index) => index !== fileIndex);
    setFiles(updatedFiles);
    form.setValue('files', updatedFiles);
  };

  const handleExpenseSubmit = (expenseData: any) => {
    form.setValue('metadata.amount', parseFloat(expenseData.amount));
    form.setValue('metadata.expenseDate', expenseData.date);
    form.setValue('metadata.isExpense', expenseData.isExpense);
    form.setValue('metadata.notes', expenseData.notes);
    // Add expense category as a tag
    const tags = form.getValues('metadata.tags');
    form.setValue('metadata.tags', [...tags, expenseData.category]);
    
    setActiveTab("document");
  };

  const onSubmit = async (data: DocumentUploadFormValues) => {
    if (data.files.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one document",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload files to Supabase storage
      const uploadResults = await Promise.all(
        data.files.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `${data.metadata.entityType}/${data.metadata.entityId || 'general'}/${fileName}`;
          
          const { data: uploadData, error } = await supabase.storage
            .from('construction_documents')
            .upload(filePath, file);

          if (error) throw error;
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('construction_documents')
            .getPublicUrl(filePath);
            
          return {
            name: file.name,
            size: file.size,
            type: file.type,
            path: filePath,
            url: publicUrl
          };
        })
      );

      // Prepare tags array including the category
      const documentTags = [
        data.metadata.category,
        ...(data.metadata.tags || [])
      ];

      // Record document metadata in documents table
      for (const uploadResult of uploadResults) {
        const documentData = {
          file_name: uploadResult.name,
          file_type: uploadResult.type,
          file_size: uploadResult.size,
          storage_path: uploadResult.path,
          entity_type: data.metadata.entityType,
          entity_id: data.metadata.entityId || '',
          category: data.metadata.category,
          amount: data.metadata.amount,
          expense_date: data.metadata.expenseDate ? data.metadata.expenseDate.toISOString() : null,
          version: data.metadata.version,
          is_expense: data.metadata.isExpense,
          notes: data.metadata.notes,
          uploaded_by: 'current_user', // In a real app with auth, this would be the authenticated user
          tags: documentTags,
        };

        const { error: dbError } = await supabase
          .from('documents')
          .insert(documentData);

        if (dbError) throw dbError;
      }

      // Show success state
      setIsSuccess(true);
      
      // After successful upload
      if (onSuccess) {
        setTimeout(() => {
          onSuccess({
            ...data,
            files: uploadResults,
          });
        }, 1000);
      }

      toast({
        title: "Success",
        description: `Document(s) uploaded successfully`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle>Upload Complete!</CardTitle>
          <CardDescription className="mt-2">
            Your document has been successfully uploaded
          </CardDescription>
          <Button 
            onClick={() => {
              setFiles([]);
              setIsSuccess(false);
              form.reset();
            }} 
            className="mt-6"
          >
            Upload Another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Upload invoices, receipts, estimates, or other project documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="document">Document Details</TabsTrigger>
            <TabsTrigger value="expense">Expense Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="document">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="metadata.category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type</FormLabel>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="metadata.entityType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Related To</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select entity type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PROJECT">Project</SelectItem>
                            <SelectItem value="CUSTOMER">Customer</SelectItem>
                            <SelectItem value="ESTIMATE">Estimate</SelectItem>
                            <SelectItem value="WORK_ORDER">Work Order</SelectItem>
                            <SelectItem value="VENDOR">Supplier</SelectItem>
                            <SelectItem value="SUBCONTRACTOR">Subcontractor</SelectItem>
                            <SelectItem value="EXPENSE">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metadata.entityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder={`Enter ${form.watch('metadata.entityType').toLowerCase()} ID`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="metadata.version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Add any additional notes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Upload Documents</FormLabel>
                  <div className="space-y-2">
                    <MobileDocumentCapture onCapture={handleFilesSelected} />
                    
                    <FileUpload
                      onFilesSelected={handleFilesSelected}
                      onFileClear={handleFileClear}
                      selectedFiles={files}
                      allowCamera={true}
                      allowMultiple={true}
                      acceptedFileTypes="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                      dropzoneText="Drag documents here or click to upload"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" disabled={isSubmitting || files.length === 0} className="btn-premium">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Upload Document
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="expense">
            <ExpenseForm onSubmit={handleExpenseSubmit} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
