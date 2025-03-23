
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
 * Hook to fetch and manage project expenses with improved error handling and performance
 */
export const useProjectExpenses = (projectId: string) => {
  const fetchExpenses = async () => {
    try {
      // Get all expenses in a single query with budget item information
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select(`
          *,
          budget_item:budget_item_id(category)
        `)
        .eq('entity_type', 'PROJECT')
        .eq('entity_id', projectId)
        .order('expense_date', { ascending: false });
        
      if (error) throw error;
      
      // Create a Set of unique vendor IDs for batch fetching
      const vendorIds = new Set<string>();
      expenses.forEach(expense => {
        if (expense.vendor_id) {
          vendorIds.add(expense.vendor_id);
        }
      });
      
      // Fetch all vendors in a single query if there are any vendor IDs
      let vendorMap = new Map<string, string>();
      if (vendorIds.size > 0) {
        const { data: vendors, error: vendorError } = await supabase
          .from('vendors')
          .select('vendorid, vendorname')
          .in('vendorid', Array.from(vendorIds));
          
        if (vendorError) {
          console.error('Error fetching vendors:', vendorError);
          // Continue with execution instead of throwing to maintain partial functionality
        } else if (vendors) {
          // Create a mapping of vendor IDs to vendor names for efficient lookups
          vendorMap = new Map(vendors.map(v => [v.vendorid, v.vendorname]));
        }
      }
      
      // Map the expenses with vendor names and budget categories
      return expenses.map(expense => ({
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
        vendor_name: expense.vendor_id ? vendorMap.get(expense.vendor_id) || null : null
      }));
    } catch (error) {
      console.error('Error in fetchExpenses:', error);
      throw error;
    }
  };

  const { 
    data: expenses = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['project-expenses', projectId],
    queryFn: fetchExpenses,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes to improve performance
    meta: {
      onError: (error: any) => {
        console.error('Error fetching expenses:', error);
        toast({
          title: 'Error loading expenses',
          description: error.message || 'Failed to load expense data',
          variant: 'destructive'
        });
      }
    }
  });

  const handleDeleteExpense = async (expense: Expense) => {
    if (!confirm(`Are you sure you want to delete this expense?`)) {
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expense.id);
        
      if (error) throw error;
      
      await refetch();
      
      toast({
        title: 'Expense deleted',
        description: 'Expense has been deleted successfully.',
        variant: 'success' // Changed to success for better user feedback
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      toast({
        title: 'Error deleting expense',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive'
      });
      return false;
    }
  };

  const handleViewDocument = async (documentId: string) => {
    try {
      // Using a more efficient single-query approach
      const { data, error } = await supabase
        .from('documents')
        .select('document_id, file_name, storage_path')
        .eq('document_id', documentId)
        .single();
        
      if (error) throw error;
      if (!data) throw new Error('Document not found');
      
      // Fixed: The createSignedUrl method returns { data: { publicUrl: string } } without an error property
      const { data: urlData } = supabase
        .storage
        .from('construction_documents')
        .getPublicUrl(data.storage_path);
      
      // No need to check for storageError since getPublicUrl doesn't have an error return
      window.open(urlData.publicUrl, '_blank');
      return true;
    } catch (error: any) {
      console.error('Error accessing document:', error);
      toast({
        title: 'Error accessing document',
        description: error.message || 'Could not access the document',
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
