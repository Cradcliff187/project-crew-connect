import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import BudgetOverview from './BudgetOverview';
import BudgetItemsTable from './components/BudgetItemsTable';
import ExpensesTable from './components/ExpensesTable';
import BudgetFormDialog from './BudgetFormDialog';
import BudgetItemFormDialog from './BudgetItemFormDialog';
import ExpenseFormDialog from './ExpenseFormDialog';
import BudgetItemDetailModal from './components/BudgetItemDetailModal';
import { DollarSign, Plus, Filter } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { useProjectExpenses, Expense as ProjectExpenseType } from './hooks/useProjectExpenses';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Project = Database['public']['Tables']['projects']['Row'];
type BudgetItem = Database['public']['Tables']['project_budget_items']['Row'];
type Expense = Database['public']['Tables']['expenses']['Row'];

// Type definitions: Define a more detailed type for budget items
// Explicitly list all fields expected after the backend change
type BudgetItemWithDetails = BudgetItem & {
  quantity: number; // Now directly available
  base_cost: number; // Now directly available
  selling_unit_price: number; // Now directly available
  markup_percentage: number; // Now directly available
  markup_amount: number; // Now directly available
  selling_total_price: number; // Now directly available
  gross_margin_percentage: number; // Now directly available
  gross_margin_amount: number; // Now directly available
  notes?: string | null; // Included notes
  cost_code_id?: string | null; // If available
  category_id?: string | null; // If available
  // Keep joined vendor/sub data
  vendors?: { vendorname: string | null } | null;
  subcontractors?: { subname: string | null } | null;
  document_id?: string | null; // Already included
};

interface ProjectBudgetProps {
  projectId: string;
}

const ProjectBudget: React.FC<ProjectBudgetProps> = ({ projectId }) => {
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showBudgetItemDialog, setShowBudgetItemDialog] = useState(false);
  const [editingBudgetItem, setEditingBudgetItem] = useState<BudgetItem | null>(null);
  const [deletingBudgetItem, setDeletingBudgetItem] = useState<BudgetItem | null>(null);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ProjectExpenseType | null>(null);
  const [expenseFilter, setExpenseFilter] = useState<string>('all');
  const [selectedBudgetItemDetail, setSelectedBudgetItemDetail] = useState<BudgetItem | null>(null);
  const [isBudgetItemDetailModalOpen, setIsBudgetItemDetailModalOpen] = useState(false);

  // Fetch project summary and budget items
  const {
    data: projectSummaryData,
    isLoading: isLoadingProject,
    error: projectError,
    refetch: refetchProject,
  } = useQuery({
    queryKey: ['project-budget-summary', projectId],
    queryFn: async () => {
      // Define the explicit columns to select for budget items
      const budgetItemColumns = `
        id, project_id, category, description, quantity,
        base_cost, selling_unit_price, markup_percentage, markup_amount,
        selling_total_price, gross_margin_percentage, gross_margin_amount,
        estimated_amount, actual_amount, estimate_item_origin_id,
        vendor_id, subcontractor_id,
        created_at, updated_at, document_id,
        vendors ( vendorname ),
        subcontractors ( subname )
      `;

      const [projectResult, budgetItemsResult] = await Promise.all([
        supabase
          .from('projects')
          .select(
            'projectid, projectname, total_budget, current_expenses, budget_status, original_base_cost, original_selling_price, original_contingency_amount' // Select new summary fields
          )
          .eq('projectid', projectId)
          .single(),
        supabase
          .from('project_budget_items')
          .select(budgetItemColumns) // Use the explicit column list
          .eq('project_id', projectId)
          .order('created_at'), // Order by creation or description? Using created_at for now
      ]);

      if (projectResult.error) throw projectResult.error;
      if (!projectResult.data) throw new Error('Project not found');
      if (budgetItemsResult.error)
        console.warn('Error fetching budget items:', budgetItemsResult.error);

      return {
        project: projectResult.data as Project,
        budgetItems: (budgetItemsResult.data || []) as BudgetItemWithDetails[], // Cast to the more detailed type
      };
    },
    meta: {
      onError: (error: any) => {
        console.error('Error fetching project budget summary:', error);
        toast({
          title: 'Error loading budget summary',
          description: error.message,
          variant: 'destructive',
        });
      },
    },
  });

  // Fetch expenses using the dedicated hook
  const {
    expenses,
    isLoading: isLoadingExpenses,
    error: expensesError,
    refetch: refetchExpenses,
    handleDeleteExpense,
    handleViewDocument,
  } = useProjectExpenses(projectId);

  const isLoading = isLoadingProject || isLoadingExpenses;
  const error = projectError || expensesError;

  const projectData = projectSummaryData?.project;
  // Use the extended type here too
  const budgetItemsData = (projectSummaryData?.budgetItems || []) as BudgetItemWithDetails[];
  const expensesData = expenses || [];

  // Calculate filtered expenses
  const filteredExpenses = useMemo(() => {
    if (expenseFilter === 'all') {
      return expensesData;
    }
    // Assuming expense_type stores 'LABOR', 'MATERIAL', etc.
    // Adjust logic if category is stored differently
    return expensesData.filter(
      exp => exp.expense_type?.toUpperCase() === expenseFilter.toUpperCase()
    );
  }, [expensesData, expenseFilter]);

  // Derive unique expense types for filter dropdown
  const expenseTypes = useMemo(() => {
    const types = new Set<string>();
    expensesData.forEach(exp => {
      if (exp.expense_type) {
        types.add(exp.expense_type.toUpperCase());
      }
    });
    return Array.from(types);
  }, [expensesData]);

  // Combined refetch function
  const refetchAll = useCallback(() => {
    refetchProject();
    refetchExpenses();
  }, [refetchProject, refetchExpenses]);

  // Callback for when overall budget amount is updated
  const handleBudgetUpdated = () => {
    refetchAll();
    setShowBudgetDialog(false);
    toast({
      title: 'Budget updated',
      description: 'Project budget has been updated successfully.',
    });
  };

  // --- Budget Item CRUD Handlers ---
  const handleAddBudgetItem = () => {
    setEditingBudgetItem(null);
    setShowBudgetItemDialog(true);
  };

  const handleEditBudgetItem = (item: BudgetItem) => {
    setEditingBudgetItem(item);
    setShowBudgetItemDialog(true);
  };

  const handleBudgetItemSaved = () => {
    setShowBudgetItemDialog(false);
    setEditingBudgetItem(null);
    refetchProject();
  };

  const openDeleteConfirmation = (item: BudgetItem) => {
    setDeletingBudgetItem(item);
  };

  const handleDeleteBudgetItem = async () => {
    if (!deletingBudgetItem) return;

    try {
      const { error } = await supabase
        .from('project_budget_items')
        .delete()
        .eq('id', deletingBudgetItem.id);

      if (error) throw error;

      toast({
        title: 'Budget item deleted',
        description: 'The budget item has been removed.',
      });
      setDeletingBudgetItem(null);
      refetchProject();
    } catch (err: any) {
      console.error('Error deleting budget item:', err);
      toast({
        title: 'Error',
        description: `Failed to delete budget item: ${err.message}`,
        variant: 'destructive',
      });
      setDeletingBudgetItem(null);
    }
  };

  // --- Expense CRUD Handlers ---
  const handleEditExpense = (expense: ProjectExpenseType) => {
    setEditingExpense(expense);
    setShowExpenseDialog(true);
  };

  const handleExpenseSaved = () => {
    setShowExpenseDialog(false);
    setEditingExpense(null);
    refetchAll();
  };

  const handleExpenseDialogCancel = () => {
    setShowExpenseDialog(false);
    setEditingExpense(null);
  };

  // Handler to open the Add Expense dialog (without pre-filling data)
  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowExpenseDialog(true);
  };

  // Add handlers for budget item detail modal
  const handleBudgetItemRowClick = (item: BudgetItem) => {
    setSelectedBudgetItemDetail(item);
    setIsBudgetItemDetailModalOpen(true);
  };

  const handleCloseBudgetItemDetailModal = () => {
    setIsBudgetItemDetailModalOpen(false);
    setSelectedBudgetItemDetail(null); // Clear selection on close
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !projectData) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive mb-4">Failed to load budget information</p>
        <Button onClick={() => refetchAll()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Budget & Expenses</h2>
        <div>
          <Button
            size="sm"
            onClick={() => setShowBudgetDialog(true)}
            className="bg-[#0485ea] hover:bg-[#0375d1]"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            {projectData?.total_budget > 0 ? 'Update Total Budget' : 'Set Total Budget'}
          </Button>
        </div>
      </div>

      <BudgetOverview
        totalBudget={projectData?.total_budget || 0}
        originalSellingPrice={projectData?.original_selling_price || 0}
        originalContingency={projectData?.original_contingency_amount || 0}
        currentExpenses={projectData?.current_expenses || 0}
        budgetStatus={projectData?.budget_status || 'not_set'}
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Budget Details</CardTitle>
              <CardDescription>Plan vs Actual Costs</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={handleAddBudgetItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Budget Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <BudgetItemsTable
            items={budgetItemsData}
            onEditItem={handleEditBudgetItem}
            onDeleteItem={openDeleteConfirmation}
            onRowClick={handleBudgetItemRowClick}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Expense Log</CardTitle>
              <CardDescription>All expenses logged against this project.</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={expenseFilter} onValueChange={setExpenseFilter}>
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue placeholder="Filter by category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {expenseTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {(type.charAt(0) + type.slice(1).toLowerCase()).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={handleAddExpense}>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ExpensesTable
            expenses={filteredExpenses}
            onEditExpense={handleEditExpense}
            onDeleteExpense={async exp => {
              const deleted = await handleDeleteExpense(exp);
              if (deleted) refetchAll();
            }}
            onViewDocument={handleViewDocument}
          />
        </CardContent>
      </Card>

      {showBudgetDialog && (
        <BudgetFormDialog
          projectId={projectId}
          initialBudget={projectData?.total_budget || 0}
          onSave={handleBudgetUpdated}
          onCancel={() => setShowBudgetDialog(false)}
        />
      )}

      {showBudgetItemDialog && (
        <BudgetItemFormDialog
          projectId={projectId}
          budgetItem={editingBudgetItem}
          open={showBudgetItemDialog}
          onOpenChange={setShowBudgetItemDialog}
          onSave={handleBudgetItemSaved}
        />
      )}

      {showExpenseDialog && (
        <ExpenseFormDialog
          projectId={projectId}
          expense={editingExpense}
          onSave={handleExpenseSaved}
          onCancel={handleExpenseDialogCancel}
          open={showExpenseDialog}
          onOpenChange={setShowExpenseDialog}
        />
      )}

      {isBudgetItemDetailModalOpen && (
        <BudgetItemDetailModal
          item={selectedBudgetItemDetail as BudgetItemWithDetails | null}
          isOpen={isBudgetItemDetailModalOpen}
          onClose={handleCloseBudgetItemDetailModal}
          onViewDocument={handleViewDocument}
        />
      )}

      <AlertDialog open={!!deletingBudgetItem} onOpenChange={() => setDeletingBudgetItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the budget item "
              <strong>{deletingBudgetItem?.description || 'this item'}</strong>". Any linked
              expenses might need manual reallocation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingBudgetItem(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBudgetItem}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectBudget;
