import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Plus, Edit, Trash, FileText, ExternalLink } from 'lucide-react';
import ExpenseFormDialog from './ExpenseFormDialog';

interface Expense {
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

interface Document {
  document_id: string;
  file_name: string;
  storage_path: string;
}

interface ProjectExpensesProps {
  projectId: string;
  onRefresh?: () => void;
}

const ProjectExpenses: React.FC<ProjectExpensesProps> = ({ projectId, onRefresh }) => {
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
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
          budget_item:budget_item_id(*)
        `)
        .eq('entity_type', 'PROJECT')
        .eq('entity_id', projectId)
        .order('expense_date', { ascending: false });
        
      if (error) throw error;
      
      return data.map(expense => {
        let vendorName = null;
        
        if (expense.vendor_id) {
          const vendorData = async () => {
            const { data } = await supabase
              .from('vendors')
              .select('vendorname')
              .eq('vendorid', expense.vendor_id)
              .single();
            return data?.vendorname;
          };
          
          vendorName = vendorData() || null;
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
          updated_at: expense.updated_at,
          budget_item_category: expense.budget_item?.category || null,
          vendor_name: vendorName
        };
      });
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

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowFormDialog(true);
  };

  const handleDeleteExpense = async (expense: any) => {
    if (confirm(`Are you sure you want to delete this expense?`)) {
      try {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', expense.id);
          
        if (error) throw error;
        
        refetch();
        if (onRefresh) onRefresh();
        
        toast({
          title: 'Expense deleted',
          description: 'Expense has been deleted successfully.',
        });
      } catch (error: any) {
        toast({
          title: 'Error deleting expense',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatExpenseDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
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
    } catch (error: any) {
      toast({
        title: 'Error accessing document',
        description: error.message,
        variant: 'destructive'
      });
    }
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
          onClick={() => { setSelectedExpense(null); setShowFormDialog(true); }}
          className="bg-[#0485ea] hover:bg-[#0375d1]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No expenses recorded. Click 'Add Expense' to create one.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Document</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{formatExpenseDate(expense.expense_date)}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    {expense.budget_item_category ? (
                      <Badge variant="outline">
                        {expense.budget_item_category}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Uncategorized</span>
                    )}
                  </TableCell>
                  <TableCell>{expense.vendor_name || 'N/A'}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(expense.amount)}</TableCell>
                  <TableCell>
                    {expense.document_id ? (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleViewDocument(expense.document_id!)}
                      >
                        <FileText className="h-4 w-4 text-blue-500" />
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditExpense(expense)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense)}>
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {showFormDialog && (
          <ExpenseFormDialog
            projectId={projectId}
            expense={selectedExpense}
            onSave={handleExpenseSaved}
            onCancel={() => { setShowFormDialog(false); setSelectedExpense(null); }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectExpenses;
