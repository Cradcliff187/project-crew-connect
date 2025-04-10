
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Schema definition
export const expenseFormSchema = z.object({
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

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface UseExpenseFormProps {
  projectId: string;
  expense: any | null;
  onSave: () => void;
}

export const useExpenseForm = ({ projectId, expense, onSave }: UseExpenseFormProps) => {
  const [budgetItems, setBudgetItems] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
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
      if (expense) {
        // Update existing expense
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
        // Create new expense
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
  
  const handleDocumentUploaded = (documentId: string) => {
    form.setValue('document_id', documentId);
    setShowDocumentUpload(false);
    toast({
      title: 'Document attached',
      description: 'The document has been successfully attached to this expense.',
    });
  };
  
  return {
    form,
    budgetItems,
    vendors,
    showDocumentUpload,
    setShowDocumentUpload,
    onSubmit: form.handleSubmit(onSubmit),
    handleDocumentUploaded,
    isEditing: !!expense
  };
};
