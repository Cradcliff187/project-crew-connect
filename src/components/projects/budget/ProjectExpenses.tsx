import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ExpenseFormDialog from './ExpenseFormDialog';
import ExpensesTable from './components/ExpensesTable';
import { useProjectExpenses } from './hooks/useProjectExpenses';

interface ProjectExpensesProps {
  projectId: string;
  onRefresh?: () => void;
}

const ProjectExpenses: React.FC<ProjectExpensesProps> = ({ projectId, onRefresh }) => {
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);

  const { expenses, isLoading, error, refetch, handleDeleteExpense, handleViewDocument } =
    useProjectExpenses(projectId);

  const handleExpenseSaved = () => {
    refetch();
    if (onRefresh) onRefresh();
    setShowFormDialog(false);
    setSelectedExpense(null);
    toast({
      title: 'Expense saved',
      description: 'Expense has been saved successfully.',
    });
  };

  const handleEditExpense = (expense: any) => {
    setSelectedExpense(expense);
    setShowFormDialog(true);
  };

  const handleDeleteWithRefresh = async (expense: any) => {
    const deleted = await handleDeleteExpense(expense);
    if (deleted && onRefresh) onRefresh();
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive mb-4">Failed to load expenses</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Project Expenses</CardTitle>
        <Button
          size="sm"
          onClick={() => {
            setSelectedExpense(null);
            setShowFormDialog(true);
          }}
          className="bg-[#0485ea] hover:bg-[#0375d1]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </CardHeader>
      <CardContent>
        <ExpensesTable
          expenses={expenses}
          onEditExpense={handleEditExpense}
          onDeleteExpense={handleDeleteWithRefresh}
          onViewDocument={handleViewDocument}
        />

        {showFormDialog && (
          <ExpenseFormDialog
            projectId={projectId}
            expense={selectedExpense}
            onSave={handleExpenseSaved}
            onCancel={() => {
              setShowFormDialog(false);
              setSelectedExpense(null);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectExpenses;
