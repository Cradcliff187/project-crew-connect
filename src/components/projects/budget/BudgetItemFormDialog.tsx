import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
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
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type BudgetItem = Database['public']['Tables']['project_budget_items']['Row'];

// Define the form schema using Zod
const budgetItemSchema = z.object({
  category: z.string().min(1, { message: 'Category is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  estimated_cost: z.number().min(0, { message: 'Estimated cost must be zero or positive' }),
  // Add other fields as needed (e.g., quantity, unit cost)
});

type BudgetItemFormValues = z.infer<typeof budgetItemSchema>;

interface BudgetItemFormDialogProps {
  projectId: string;
  budgetItem: BudgetItem | null; // Pass null for adding, existing item for editing
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void; // Callback to trigger data refresh
}

const BudgetItemFormDialog: React.FC<BudgetItemFormDialogProps> = ({
  projectId,
  budgetItem,
  open,
  onOpenChange,
  onSave,
}) => {
  const isEditing = !!budgetItem;

  const form = useForm<BudgetItemFormValues>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: {
      category: budgetItem?.category || '',
      description: budgetItem?.description || '',
      estimated_cost: budgetItem?.estimated_cost || 0,
      // Set other defaults
    },
  });

  // Reset form when budgetItem changes (e.g., opening for edit vs add)
  useEffect(() => {
    if (open) {
      form.reset({
        category: budgetItem?.category || '',
        description: budgetItem?.description || '',
        estimated_cost: budgetItem?.estimated_cost || 0,
        // Reset other fields
      });
    }
  }, [budgetItem, open, form]);

  const onSubmit = async (values: BudgetItemFormValues) => {
    try {
      const dataToSave = {
        ...values,
        project_id: projectId,
      };

      let error;
      if (isEditing && budgetItem?.id) {
        ({ error } = await supabase
          .from('project_budget_items')
          .update(dataToSave)
          .eq('id', budgetItem.id));
      } else {
        ({ error } = await supabase.from('project_budget_items').insert(dataToSave));
      }

      if (error) throw error;

      toast({
        title: `Budget item ${isEditing ? 'updated' : 'added'}`,
        description: 'Budget item saved successfully.',
      });
      onSave(); // Trigger refresh
      onOpenChange(false); // Close dialog
    } catch (err: any) {
      console.error('Error saving budget item:', err);
      toast({
        title: 'Error',
        description: `Failed to save budget item: ${err.message}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Budget Item' : 'Add Budget Item'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update details for this budget item.'
              : 'Add a new item to the project budget.'}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Materials, Labor, Permits" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detailed description of the budget item" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estimated_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Cost ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)} // Ensure value is number
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* TODO: Add fields for quantity, unit cost, etc. if needed */}

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0485ea] hover:bg-[#0375d1]">
                {isEditing ? 'Update' : 'Add'} Item
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetItemFormDialog;
