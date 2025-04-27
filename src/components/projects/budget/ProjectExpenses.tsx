import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import ExpensesTable from './components/ExpensesTable';
import { useProjectExpenses } from './hooks/useProjectExpenses';

interface ProjectExpensesProps {
  projectId: string;
  onRefresh?: () => void;
}

const ProjectExpenses: React.FC<ProjectExpensesProps> = ({ projectId, onRefresh }) => {
  const { expenses, isLoading, error, refetch, handleDeleteExpense, handleViewDocument } =
    useProjectExpenses(projectId);

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
      </CardHeader>
      <CardContent>
        <ExpensesTable
          expenses={expenses}
          onEditExpense={() => {
            console.warn('Edit Expense needs reimplementation');
          }}
          onDeleteExpense={handleDeleteExpense}
          onViewDocument={handleViewDocument}
        />
      </CardContent>
    </Card>
  );
};

export default ProjectExpenses;
