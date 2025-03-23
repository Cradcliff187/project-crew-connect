import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';

interface Expense {
  id: string;
  project_id: string;
  budget_item_id: string | null;
  expense_date: string;
  amount: number;
  vendor_id: string | null;
  description: string;
  document_id: string | null;
}

interface BudgetItem {
  id: string;
  category: string;
  description: string;
}

interface Vendor {
  vendorid: string;
  vendorname: string;
}

interface ExpenseFormDialogProps {
  projectId: string;
  expense: Expense | null;
  onSave: () => void;
  onCancel: () => void;
}

const expenseFormSchema = z.object({
  budget_item_id: z.string().optional().nullable(),
  expense_date: z.date({
    required_error: "Please select a date",
  }),
  amount: z.preprocess(
    (val) => (val === '' ? 0 : Number(val)),
    z.number().min(0, { message: 'Amount must be a positive number' })
  ),
  vendor_id: z.string().optional().nullable(),
  description: z.string().min(1, { message: 'Description is required' }),
  document_id: z.string().optional().nullable(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

const ExpenseFormDialog: React.FC<ExpenseFormDialogProps> = ({ 
  projectId, 
  expense, 
  onSave, 
  onCancel 
}) => {
  const isEditing = !!expense;
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  
  const defaultValues: ExpenseFormValues = {
    budget_item_id: expense?.budget_item_id || null,
    expense_date: expense?.expense_date ? new Date(expense.expense_date) : new Date(),
    amount: expense?.amount || 0,
    vendor_id: expense?.vendor_id || null,
    description: expense?.description || '',
    document_id: expense?.document_id || null,
  };
  
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues,
  });
  
  useEffect(() => {
    const fetchBudgetItems = async () => {
      try {
        const { data, error } = await supabase
          .from('project_budget_items')
          .select('id, category, description')
          .eq('project_id', projectId);
          
        if (error) throw error;
        setBudgetItems(data);
      } catch (error: any) {
        console.error('Error fetching budget items:', error);
        toast({
          title: 'Error loading budget items',
          description: error.message,
          variant: 'destructive'
        });
      }
    };
    
    const fetchVendors = async () => {
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('vendorid, vendorname')
          .order('vendorname');
          
        if (error) throw error;
        setVendors(data);
      } catch (error: any) {
        console.error('Error fetching vendors:', error);
        toast({
          title: 'Error loading vendors',
          description: error.message,
          variant: 'destructive'
        });
      }
    };
    
    fetchBudgetItems();
    fetchVendors();
  }, [projectId]);
  
  const onSubmit = async (values: ExpenseFormValues) => {
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('expenses')
          .update({
            entity_id: projectId,
            entity_type: 'PROJECT',
            budget_item_id: values.budget_item_id,
            expense_date: values.expense_date.toISOString(),
            amount: values.amount,
            expense_type: 'project_expense',
            vendor_id: values.vendor_id,
            description: values.description,
            document_id: values.document_id,
            unit_price: values.amount,
            quantity: 1
          })
          .eq('id', expense.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert({
            entity_id: projectId,
            entity_type: 'PROJECT',
            budget_item_id: values.budget_item_id,
            expense_date: values.expense_date.toISOString(),
            amount: values.amount,
            expense_type: 'project_expense',
            vendor_id: values.vendor_id,
            description: values.description,
            document_id: values.document_id,
            unit_price: values.amount,
            quantity: 1
          });
          
        if (error) throw error;
      }
      
      onSave();
    } catch (error: any) {
      console.error('Error saving expense:', error);
      toast({
        title: 'Error saving expense',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  
  const handleDocumentUploaded = async (documentId: string) => {
    form.setValue('document_id', documentId);
    setShowDocumentUpload(false);
    toast({
      title: 'Document attached',
      description: 'The document has been successfully attached to this expense.',
    });
  };
  
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        </DialogHeader>
        
        {showDocumentUpload ? (
          <div className="mt-4">
            <EnhancedDocumentUpload 
              entityType="PROJECT"
              entityId={projectId}
              isReceiptUpload={true}
              onSuccess={() => setShowDocumentUpload(false)}
              onCancel={() => setShowDocumentUpload(false)}
            />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe this expense"
                        {...field}
                      />
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
              
              <FormField
                control={form.control}
                name="expense_date"
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
              
              <FormField
                control={form.control}
                name="budget_item_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a budget category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Uncategorized</SelectItem>
                        {budgetItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.category} {item.description ? `- ${item.description}` : ''}
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
                name="vendor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a vendor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No Vendor</SelectItem>
                        {vendors.map((vendor) => (
                          <SelectItem key={vendor.vendorid} value={vendor.vendorid}>
                            {vendor.vendorname}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-between items-center">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowDocumentUpload(true)}
                >
                  Attach Receipt
                </Button>
                
                {form.watch('document_id') && (
                  <span className="text-sm text-green-600">Receipt attached</span>
                )}
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#0485ea] hover:bg-[#0375d1]">
                  {isEditing ? 'Update' : 'Add'} Expense
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseFormDialog;
