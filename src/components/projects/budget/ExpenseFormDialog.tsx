import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DocumentUpload from '@/components/documents/DocumentUpload';
import { EntityType } from '@/components/documents/schemas/documentSchema';

const formSchema = z.object({
  expenseName: z.string().min(2, {
    message: "Expense name must be at least 2 characters.",
  }),
  amount: z.number({
    required_error: "Amount is required.",
  }).min(0.01, {
    message: "Amount must be greater than 0.",
  }),
  vendorId: z.string().optional(),
});

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess: () => void;
}

const ExpenseFormDialog: React.FC<ExpenseFormDialogProps> = ({ open, onOpenChange, projectId, onSuccess }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expenseName: "",
      amount: 0,
      vendorId: "",
    },
  });

  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
  };

  const handleReceiptUploadSuccess = () => {
    onSuccess();
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Expense</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => {})} className="space-y-4">
            <FormField
              control={form.control}
              name="expenseName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter expense name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter amount"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DocumentUpload
              entityType={EntityType.PROJECT}
              entityId={projectId}
              isReceiptUpload={true}
              onSuccess={handleReceiptUploadSuccess}
              onCancel={handleCancel}
              prefillData={{
                amount: Number(form.watch('amount')),
                vendorId: form.watch('vendorId'),
              }}
            />
            <div className="flex justify-end">
              <Button type="button" variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseFormDialog;
