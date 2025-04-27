import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { addDiscount } from '@/services/discountService'; // Import the service function
import { Loader2 } from 'lucide-react';

interface AddDiscountDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscountAdded: () => void; // Callback to refresh data
}

const discountSchema = z.object({
  amount: z.preprocess(
    val => (val === '' ? undefined : Number(val)),
    z
      .number({ required_error: 'Amount is required.' })
      .positive({ message: 'Amount must be positive.' })
  ),
  description: z.string().optional(),
});

type DiscountFormValues = z.infer<typeof discountSchema>;

const AddDiscountDialog: React.FC<AddDiscountDialogProps> = ({
  projectId,
  open,
  onOpenChange,
  onDiscountAdded,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      amount: undefined,
      description: '',
    },
  });

  const onSubmit = async (values: DiscountFormValues) => {
    setIsSubmitting(true);
    try {
      const newDiscount = await addDiscount(projectId, values.amount, values.description);
      if (newDiscount) {
        onDiscountAdded(); // Call refresh callback
        onOpenChange(false); // Close dialog
        form.reset(); // Reset form
      }
    } catch (error) {
      // Error toast is handled within addDiscount service
      console.error('Dialog submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Project Discount</DialogTitle>
          <DialogDescription>Enter the amount and description for the discount.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        className="pl-7"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Reason for discount..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Discount
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDiscountDialog;
