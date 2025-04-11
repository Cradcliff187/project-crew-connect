
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Receipt, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkOrderExpensesProps {
  workOrderId: string;
  onExpenseAdded?: () => void;
}

const WorkOrderExpenses: React.FC<WorkOrderExpensesProps> = ({ 
  workOrderId,
  onExpenseAdded 
}) => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('expenses')
          .select(`
            id, description, amount, expense_type, 
            vendor_id, document_id, created_at
          `)
          .eq('entity_id', workOrderId)
          .eq('entity_type', 'WORK_ORDER')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setExpenses(data || []);
      } catch (err) {
        console.error('Error fetching work order expenses:', err);
        toast({
          title: 'Error',
          description: 'Failed to load expenses',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchExpenses();
  }, [workOrderId, toast]);

  // Open add expense dialog
  const handleAddExpense = () => {
    // Implementation will be added later
    console.log('Add expense clicked');
    // After expense is successfully added
    if (onExpenseAdded) {
      onExpenseAdded();
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-[#0485ea]" />
          <CardTitle className="text-lg">Expenses</CardTitle>
        </div>
        <Button 
          variant="default" 
          size="sm"
          onClick={handleAddExpense}
          className="bg-[#0485ea] hover:bg-[#0375d1]"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No expenses found for this work order</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleAddExpense}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add First Expense
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Expense list will be implemented here */}
            <p>Expenses loaded: {expenses.length}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkOrderExpenses;
