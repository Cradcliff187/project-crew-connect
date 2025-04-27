import React, { useState, useEffect, useCallback } from 'react';
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
import { DollarSign, Plus } from 'lucide-react';
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

type Project = Database['public']['Tables']['projects']['Row'];
type BudgetItem = Database['public']['Tables']['project_budget_items']['Row'];
type Expense = Database['public']['Tables']['expenses']['Row'];

interface ProjectBudgetProps {
  projectId: string;
}

const ProjectBudget: React.FC<ProjectBudgetProps> = ({ projectId }) => {
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showBudgetItemDialog, setShowBudgetItemDialog] = useState(false);
  const [editingBudgetItem, setEditingBudgetItem] = useState<BudgetItem | null>(null);
  const [deletingBudgetItem, setDeletingBudgetItem] = useState<BudgetItem | null>(null);

  // Fetch project summary and budget items
  const {
    data: projectSummaryData,
    isLoading: isLoadingProject,
    error: projectError,
    refetch: refetchProject,
  } = useQuery({
    queryKey: ['project-budget-summary', projectId],
    queryFn: async () => {
      const [projectResult, budgetItemsResult] = await Promise.all([
        supabase
          .from('projects')
          .select('projectid, projectname, total_budget, current_expenses, budget_status')
          .eq('projectid', projectId)
          .single(),
        supabase
          .from('project_budget_items')
          .select('*') // Select all for table display
          .eq('project_id', projectId)
          .order('category')
          .order('description'),
      ]);

      if (projectResult.error) throw projectResult.error;
      if (!projectResult.data) throw new Error('Project not found');
      if (budgetItemsResult.error)
        console.warn('Error fetching budget items:', budgetItemsResult.error);

      return {
        project: projectResult.data as Project,
        budgetItems: (budgetItemsResult.data || []) as BudgetItem[],
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
  const budgetItemsData = projectSummaryData?.budgetItems || [];
  const expensesData = expenses || []; // Use expenses from the hook

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
          <Button size="sm" variant="outline" onClick={handleAddBudgetItem} className="mr-2">
            <Plus className="h-4 w-4 mr-2" />
            Add Budget Item
          </Button>
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
        currentExpenses={projectData?.current_expenses || 0}
        budgetStatus={projectData?.budget_status || 'not_set'}
      />

      <Card>
        <CardHeader>
          <CardTitle>Budget Details</CardTitle>
          <CardDescription>Plan vs Actual Costs</CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetItemsTable
            items={budgetItemsData}
            onEditItem={handleEditBudgetItem}
            onDeleteItem={openDeleteConfirmation}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Log</CardTitle>
          <CardDescription>All expenses logged against this project.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpensesTable
            expenses={expensesData}
            onEditExpense={() => {
              console.warn('Edit Expense needs reimplementation');
            }}
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
