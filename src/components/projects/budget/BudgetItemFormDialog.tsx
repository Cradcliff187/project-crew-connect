
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BudgetItem {
  id: string;
  project_id: string;
  category: string;
  description: string;
  estimated_amount: number;
  actual_amount: number;
}

interface BudgetItemFormDialogProps {
  projectId: string;
  item: BudgetItem | null;
  onSave: () => void;
  onCancel: () => void;
}

// Form schema
const budgetItemSchema = z.object({
  category: z.string().min(1, { message: 'Category is required' }),
  description: z.string().optional(),
  estimated_amount: z.preprocess(
    (val) => (val === '' ? 0 : Number(val)),
    z.number().min(0, { message: 'Amount must be a positive number' })
  ),
});

type BudgetItemFormValues = z.infer<typeof budgetItemSchema>;

// Budget category options
const BUDGET_CATEGORIES = [
  { value: 'materials', label: 'Materials' },
  { value: 'labor', label: 'Labor' },
  { value: 'subcontractors', label: 'Subcontractors' },
  { value: 'equipment', label: 'Equipment Rental' },
  { value: 'permits', label: 'Permits & Fees' },
  { value: 'overhead', label: 'Overhead' },
  { value: 'contingency', label: 'Contingency' },
  { value: 'other', label: 'Other' },
];

const BudgetItemFormDialog: React.FC<BudgetItemFormDialogProps> = ({ 
  projectId, 
  item, 
  onSave, 
  onCancel 
}) => {
  const isEditing = !!item;
  
  const form = useForm<BudgetItemFormValues>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: {
      category: item?.category || 'materials',
      description: item?.description || '',
      estimated_amount: item?.estimated_amount || 0,
    },
  });
  
  const onSubmit = async (values: BudgetItemFormValues) => {
    try {
      if (isEditing) {
        // Update existing budget item
        const { error } = await supabase
          .from('project_budget_items')
          .update({
            category: values.category,
            description: values.description,
            estimated_amount: values.estimated_amount,
          })
          .eq('id', item.id);
          
        if (error) throw error;
      } else {
        // Insert new budget item
        const { error } = await supabase
          .from('project_budget_items')
          .insert({
            project_id: projectId,
            category: values.category,
            description: values.description,
            estimated_amount: values.estimated_amount,
          });
          
        if (error) throw error;
      }
      
      onSave();
    } catch (error: any) {
      console.error('Error saving budget item:', error);
      toast({
        title: 'Error saving budget item',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Budget Item' : 'Add Budget Item'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BUDGET_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <Textarea
                      placeholder="Enter a description for this budget item"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="estimated_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="pl-8"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0485ea] hover:bg-[#0375d1]">
                {isEditing ? 'Update' : 'Create'} Budget Item
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetItemFormDialog;
