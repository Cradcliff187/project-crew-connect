
import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface SubcontractorExpensesProps {
  subcontractorId: string;
}

interface Expense {
  expense_id: string;
  work_order_id: string;
  work_order_title: string;
  expense_name: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
}

const SubcontractorExpenses = ({ subcontractorId }: SubcontractorExpensesProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        // Fetch expenses from the database
        const { data, error } = await supabase
          .from('expenses')
          .select('expense_id, work_order_id, expense_name, amount, date, category, notes')
          .eq('vendor_id', subcontractorId)
          .eq('vendor_type', 'SUBCONTRACTOR');

        if (error) throw error;

        // Fetch work order titles for each expense
        if (data && data.length > 0) {
          const workOrderIds = [...new Set(data.map(exp => exp.work_order_id))];
          
          const { data: workOrders, error: woError } = await supabase
            .from('work_orders')
            .select('work_order_id, title')
            .in('work_order_id', workOrderIds);
          
          if (woError) throw woError;
          
          const workOrderMap = (workOrders || []).reduce((acc, wo) => {
            acc[wo.work_order_id] = wo.title;
            return acc;
          }, {} as Record<string, string>);
          
          // Combine data
          const enrichedExpenses = data.map(exp => ({
            ...exp,
            work_order_title: workOrderMap[exp.work_order_id] || 'Unknown Work Order'
          }));
          
          setExpenses(enrichedExpenses);
        } else {
          setExpenses([]);
        }
      } catch (error: any) {
        console.error('Error fetching expenses:', error);
        toast({
          title: 'Error',
          description: 'Failed to load expenses. ' + error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [subcontractorId]);

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Expenses</CardTitle>
        <Button size="sm" className="bg-[#0485ea] hover:bg-[#0375d1]">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No expenses found for this subcontractor</p>
            <Button size="sm" className="mt-4 bg-[#0485ea] hover:bg-[#0375d1]">
              <Plus className="h-4 w-4 mr-2" />
              Add First Expense
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expense</TableHead>
                    <TableHead>Work Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.expense_id}>
                      <TableCell>{expense.expense_name}</TableCell>
                      <TableCell>{expense.work_order_title}</TableCell>
                      <TableCell>{formatDate(expense.date)}</TableCell>
                      <TableCell>
                        <span className="capitalize">{expense.category?.toLowerCase() || 'Uncategorized'}</span>
                      </TableCell>
                      <TableCell>{formatCurrency(expense.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-4 flex justify-end">
              <div className="bg-muted p-4 rounded-md w-64">
                <div className="flex justify-between">
                  <span>Total Expenses:</span>
                  <span className="font-medium">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SubcontractorExpenses;
