
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface BudgetFormDialogProps {
  projectId: string;
  initialBudget: number;
  onSave: () => void;
  onCancel: () => void;
}

// Form schema
const budgetFormSchema = z.object({
  total_budget: z.preprocess(
    (val) => (val === '' ? 0 : Number(val)),
    z.number().min(0, { message: 'Budget must be a positive number' })
  ),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

const BudgetFormDialog: React.FC<BudgetFormDialogProps> = ({ 
  projectId, 
  initialBudget, 
  onSave, 
  onCancel 
}) => {
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      total_budget: initialBudget,
    },
  });
  
  const onSubmit = async (values: BudgetFormValues) => {
    try {
      // Update project budget
      const { error } = await supabase
        .from('projects')
        .update({
          total_budget: values.total_budget,
        })
        .eq('projectid', projectId);
        
      if (error) throw error;
      
      onSave();
    } catch (error: any) {
      console.error('Error saving budget:', error);
      toast({
        title: 'Error updating budget',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Project Budget</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="total_budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Budget</FormLabel>
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
                  <FormDescription>
                    Set the total budget for this project. This will be used to track expenses and budget status.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0485ea] hover:bg-[#0375d1]">
                Update Budget
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetFormDialog;
