
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getBudgetItemCategory } from '../utils/expenseUtils';

export interface Expense {
  id: string;
  project_id: string;
  budget_item_id: string | null;
  expense_date: string;
  amount: number;
  vendor_id: string | null;
  description: string;
  document_id: string | null;
  created_at: string;
  budget_item_category?: string;
  vendor_name?: string;
}

export interface Document {
  document_id: string;
  file_name: string;
  storage_path: string;
}

/**
 * Hook to fetch and manage project expenses
 */
export const useProjectExpenses = (projectId: string) => {
  const { 
    data: expenses = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['project-expenses', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          budget_item:budget_item_id(category)
        `)
        .eq('entity_type', 'PROJECT')
        .eq('entity_id', projectId)
        .order('expense_date', { ascending: false });
        
      if (error) throw error;
      
      return Promise.all(data.map(async expense => {
        let vendorName = null;
        
        if (expense.vendor_id) {
          try {
            const { data } = await supabase
              .from('vendors')
              .select('vendorname')
              .eq('vendorid', expense.vendor_id)
              .single();
            vendorName = data?.vendorname || null;
          } catch (err) {
            console.log('Error fetching vendor:', err);
            vendorName = null;
          }
        }
        
        return {
          id: expense.id,
          project_id: expense.entity_id,
          budget_item_id: expense.budget_item_id,
          expense_date: expense.expense_date,
          amount: expense.amount,
          vendor_id: expense.vendor_id,
          description: expense.description,
          document_id: expense.document_id,
          created_at: expense.created_at,
          budget_item_category: getBudgetItemCategory(expense.budget_item),
          vendor_name: vendorName
        };
      }));
    },
    meta: {
      onError: (error: any) => {
        console.error('Error fetching expenses:', error);
        toast({
          title: 'Error loading expenses',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  });

  const handleDeleteExpense = async (expense: Expense) => {
    if (confirm(`Are you sure you want to delete this expense?`)) {
      try {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', expense.id);
          
        if (error) throw error;
        
        refetch();
        
        toast({
          title: 'Expense deleted',
          description: 'Expense has been deleted successfully.',
        });

        return true;
      } catch (error: any) {
        toast({
          title: 'Error deleting expense',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }
    }
    return false;
  };

  const handleViewDocument = async (documentId: string) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('document_id, file_name, storage_path')
        .eq('document_id', documentId)
        .single();
        
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase
        .storage
        .from('construction_documents')
        .getPublicUrl(data.storage_path);
      
      window.open(publicUrl, '_blank');
      return true;
    } catch (error: any) {
      toast({
        title: 'Error accessing document',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    }
  };

  return {
    expenses,
    isLoading,
    error,
    refetch,
    handleDeleteExpense,
    handleViewDocument
  };
};
