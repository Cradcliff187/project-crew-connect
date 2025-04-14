import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash } from 'lucide-react';
import BudgetItemFormDialog from './BudgetItemFormDialog';

interface BudgetItem {
  id: string;
  project_id: string;
  category: string;
  description: string;
  estimated_amount: number;
  actual_amount: number;
  created_at: string;
}

interface BudgetItemsProps {
  projectId: string;
  onRefresh?: () => void;
}

const BudgetItems: React.FC<BudgetItemsProps> = ({ projectId, onRefresh }) => {
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BudgetItem | null>(null);

  // Fetch budget items
  const {
    data: budgetItems = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['budget-items', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_budget_items')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BudgetItem[];
    },
    meta: {
      onError: (error: any) => {
        console.error('Error fetching budget items:', error);
        toast({
          title: 'Error loading budget items',
          description: error.message,
          variant: 'destructive',
        });
      },
    },
  });

  const handleItemSaved = () => {
    refetch();
    if (onRefresh) onRefresh();
    setShowFormDialog(false);
    setSelectedItem(null);
    toast({
      title: 'Budget item saved',
      description: 'Budget item has been saved successfully.',
    });
  };

  const handleEditItem = (item: BudgetItem) => {
    setSelectedItem(item);
    setShowFormDialog(true);
  };

  const handleDeleteItem = async (item: BudgetItem) => {
    if (confirm(`Are you sure you want to delete the budget item "${item.category}"?`)) {
      try {
        const { error } = await supabase.from('project_budget_items').delete().eq('id', item.id);

        if (error) throw error;

        refetch();
        if (onRefresh) onRefresh();

        toast({
          title: 'Budget item deleted',
          description: 'Budget item has been deleted successfully.',
        });
      } catch (error: any) {
        toast({
          title: 'Error deleting budget item',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive mb-4">Failed to load budget items</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Budget Line Items</CardTitle>
        <Button
          size="sm"
          onClick={() => {
            setSelectedItem(null);
            setShowFormDialog(true);
          }}
          className="bg-[#0485ea] hover:bg-[#0375d1]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Budget Item
        </Button>
      </CardHeader>
      <CardContent>
        {budgetItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No budget items found. Click 'Add Budget Item' to create one.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Estimated Amount</TableHead>
                <TableHead className="text-right">Actual Amount</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead className="text-right">% Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgetItems.map(item => {
                const variance = item.estimated_amount - item.actual_amount;
                const percentUsed =
                  item.estimated_amount > 0
                    ? Math.round((item.actual_amount / item.estimated_amount) * 100)
                    : 0;
                const isOverBudget = item.actual_amount > item.estimated_amount;

                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.estimated_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.actual_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={isOverBudget ? 'text-red-500' : 'text-green-500'}>
                        {isOverBudget ? '-' : ''}
                        {formatCurrency(Math.abs(variance))}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={isOverBudget ? 'destructive' : 'outline'}>
                        {percentUsed}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item)}>
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {showFormDialog && (
          <BudgetItemFormDialog
            projectId={projectId}
            item={selectedItem}
            onSave={handleItemSaved}
            onCancel={() => {
              setShowFormDialog(false);
              setSelectedItem(null);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetItems;
