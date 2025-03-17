
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/ui/file-upload';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CalendarIcon, CheckCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { toast } from '@/components/ui/use-toast';

const formSchema = z.object({
  documentType: z.enum(['receipt', 'invoice']),
  amount: z.string().min(1, 'Amount is required'),
  date: z.date({
    required_error: "Date is required",
  }),
  supplier: z.string().min(1, 'Supplier/subcontractor name is required'),
  projectId: z.string().optional(),
  notes: z.string().optional(),
});

type DocumentUploadProps = {
  projectId?: string;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
};

export default function DocumentUpload({ projectId, onSuccess, onCancel }: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentType: 'receipt',
      amount: '',
      supplier: '',
      projectId: projectId || '',
      notes: '',
    },
  });

  const handleFilesSelected = (newFiles: File[]) => {
    if (files.length === 0) {
      setFiles(newFiles);
    } else {
      setFiles([...files, ...newFiles]);
    }
  };

  const handleFileClear = (fileIndex: number) => {
    setFiles(files.filter((_, index) => index !== fileIndex));
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one document",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real application, we would upload files to a server
      // For demonstration, we'll simulate a successful upload
      await new Promise(resolve => setTimeout(resolve, 1500));

      const uploadedData = {
        ...data,
        files: files.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
      };

      // Show success state
      setIsSuccess(true);
      
      // After successful upload
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(uploadedData);
        }, 1000);
      }

      toast({
        title: "Success",
        description: `${data.documentType === 'receipt' ? 'Receipt' : 'Invoice'} uploaded successfully`,
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
          Upload receipts from suppliers or invoices from subcontractors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="receipt" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Supplier Receipt
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="invoice" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Subcontractor Invoice
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {form.watch('documentType') === 'receipt' ? 'Supplier' : 'Subcontractor'}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="0.00" 
                        {...field} 
                        type="number" 
                        step="0.01" 
                        min="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {projectId ? (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <FormControl>
                  <Input value={projectId} disabled />
                </FormControl>
                <FormDescription>
                  This document will be associated with the current project
                </FormDescription>
              </FormItem>
            ) : (
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project ID" {...field} />
                    </FormControl>
                    <FormDescription>
                      Associate this document with a project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
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
              <Label>Upload Documents</Label>
              <FileUpload
                onFilesSelected={handleFilesSelected}
                onFileClear={handleFileClear}
                selectedFiles={files}
                allowCamera={true}
                allowMultiple={true}
                acceptedFileTypes="image/*,application/pdf"
                dropzoneText="Drag receipts/invoices here or click to upload"
              />
            </div>

            <div className="flex gap-3 justify-end">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload Document
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
