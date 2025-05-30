import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getBudgetItemCategory } from '../utils/expenseUtils';
import { Database } from '@/integrations/supabase/types';

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
  employee_name?: string;
  hours_worked?: number | null;
  expense_type?: string | null;
  time_entry_id?: string | null;
  timeEntryDetails?: {
    date: string | null;
    start: string | null;
    end: string | null;
    notes: string | null;
  } | null;
}

export interface Document {
  document_id: string;
  file_name: string;
  storage_path: string;
}

// Define the expected shape of the data returned by the query
// This should align with your actual DB schema and the select query
interface ProjectBudgetItemStub {
  id: string;
  category: string | null;
}

interface FetchedExpenseData {
  id: string;
  entity_id: string; // Use entity_id as per schema
  entity_type: string; // Include entity_type if needed for clarity/filtering
  budget_item_id: string | null;
  expense_date: string;
  amount: number;
  vendor_id: string | null;
  description: string;
  document_id: string | null;
  created_at: string;
  expense_type: string | null; // Add expense_type to fetch
  time_entry_id: string | null;
  project_budget_items: ProjectBudgetItemStub | null; // Nested object for related item
  // Add structure for nested time entry data
  time_entries: {
    hours_worked: number | null;
    date_worked: string | null;
    start_time: string | null;
    end_time: string | null;
    notes: string | null;
    employees: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  } | null;
}

/**
 * Hook to fetch and manage project expenses with improved error handling and performance
 */
export const useProjectExpenses = (projectId: string) => {
  const fetchExpenses = async (): Promise<Expense[]> => {
    try {
      // Fetch expenses directly from the table
      const { data: expensesData, error } = await supabase
        .from('expenses')
        .select(
          `
          id,
          entity_id, entity_type,
          time_entry_id,
          budget_item_id,
          expense_date,
          amount,
          vendor_id,
          description,
          document_id,
          created_at,
          expense_type,
          project_budget_items ( id, category ),
          time_entries!fk_expenses_time_entry ( date_worked, start_time, end_time, hours_worked, notes, employees!time_entries_employee_id_fkey (first_name, last_name) )
        `
        )
        .eq('entity_id', projectId)
        .eq('entity_type', 'project');

      if (error) throw error;

      // Force cast via unknown due to persistent linter issues
      const fetchedData = (expensesData as unknown as FetchedExpenseData[]) ?? [];

      // Create a Set of unique vendor IDs for batch fetching
      const vendorIds = new Set<string>();
      fetchedData.forEach(expense => {
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
      return fetchedData.map(expense => {
        const employeeName =
          expense.time_entries?.employees?.first_name && expense.time_entries?.employees?.last_name
            ? `${expense.time_entries.employees.first_name} ${expense.time_entries.employees.last_name}`
            : null;
        const hoursWorked = expense.time_entries?.hours_worked ?? null;

        // Extract time entry details for potential use
        const timeEntryDetails = expense.time_entries
          ? {
              date: expense.time_entries.date_worked,
              start: expense.time_entries.start_time,
              end: expense.time_entries.end_time,
              notes: expense.time_entries.notes,
            }
          : null;

        return {
          id: expense.id,
          project_id: expense.entity_id, // Map entity_id to project_id
          budget_item_id: expense.budget_item_id,
          time_entry_id: expense.time_entry_id,
          expense_date: expense.expense_date,
          amount: expense.amount,
          vendor_id: expense.vendor_id,
          description: expense.description,
          document_id: expense.document_id,
          created_at: expense.created_at,
          budget_item_category: getBudgetItemCategory(expense.project_budget_items),
          vendor_name: expense.vendor_id ? vendorMap.get(expense.vendor_id) || null : null,
          employee_name: employeeName,
          hours_worked: hoursWorked,
          expense_type: expense.expense_type,
          timeEntryDetails: timeEntryDetails, // Pass nested details
        };
      });
    } catch (error) {
      console.error('Error in fetchExpenses:', error);
      throw error;
    }
  };

  const {
    data: expenses = [],
    isLoading,
    error,
    refetch,
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
          variant: 'destructive',
        });
      },
    },
  });

  const handleDeleteExpense = async (expense: Expense) => {
    if (!confirm(`Are you sure you want to delete this expense?`)) {
      return false;
    }

    try {
      const { error } = await supabase.from('expenses').delete().eq('id', expense.id);

      if (error) throw error;

      await refetch();

      toast({
        title: 'Expense deleted',
        description: 'Expense has been deleted successfully.',
        variant: 'success', // Changed to success for better user feedback
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      toast({
        title: 'Error deleting expense',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive',
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

      // Create a function to view the document
      const viewUrl = await (async () => {
        if (data) {
          // Use createSignedUrl for private storage
          const { data: signedUrlData, error: urlError } = await supabase.storage
            .from('construction_documents')
            .createSignedUrl(data.storage_path, 3600); // 1 hour expiration

          if (urlError) {
            console.error('Error generating signed URL:', urlError);
            return null;
          }

          return signedUrlData?.signedUrl || null;
        }
        return null;
      })();

      if (viewUrl) {
        window.open(viewUrl, '_blank');
        return true;
      }
    } catch (error: any) {
      console.error('Error accessing document:', error);
      toast({
        title: 'Error accessing document',
        description: error.message || 'Could not access the document',
        variant: 'destructive',
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
    handleViewDocument,
  };
};
