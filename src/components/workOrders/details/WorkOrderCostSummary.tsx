
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkOrder } from '@/types/workOrder';
import { formatCurrency } from '@/lib/utils';

interface WorkOrderCostSummaryProps {
  workOrder: WorkOrder;
}

const WorkOrderCostSummary: React.FC<WorkOrderCostSummaryProps> = ({ workOrder }) => {
  const [loading, setLoading] = useState(true);
  const [laborCost, setLaborCost] = useState(0);
  const [materialsCost, setMaterialsCost] = useState(0);
  const [expensesCost, setExpensesCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  
  useEffect(() => {
    const fetchCostData = async () => {
      setLoading(true);
      try {
        console.log('Fetching cost data for work order:', workOrder.work_order_id);
        
        // Fetch time entries to calculate labor cost
        const { data: timeEntries, error: timeError } = await supabase
          .from('time_entries')
          .select('hours_worked, total_cost')
          .eq('entity_type', 'work_order')
          .eq('entity_id', workOrder.work_order_id);
          
        if (timeError) {
          console.error('Error fetching time entries:', timeError);
        }
        
        // Calculate labor cost from time entries
        const calculatedLaborCost = timeEntries?.reduce((sum, entry) => 
          sum + (entry.total_cost || 0), 0) || 0;
        
        // Fetch expenses (materials and other expenses)
        const { data: expenses, error: expensesError } = await supabase
          .from('expenses')
          .select('expense_type, amount')
          .eq('entity_type', 'WORK_ORDER')
          .eq('entity_id', workOrder.work_order_id);
          
        if (expensesError) {
          console.error('Error fetching expenses:', expensesError);
        }
        
        // Separate material expenses from other expenses
        const materials = expenses?.filter(exp => 
          exp.expense_type === 'MATERIAL') || [];
        
        const otherExpenses = expenses?.filter(exp => 
          exp.expense_type !== 'MATERIAL' && exp.expense_type !== 'TIME_RECEIPT') || [];
        
        // Calculate materials and expenses cost
        const calculatedMaterialsCost = materials.reduce((sum, mat) => 
          sum + (mat.amount || 0), 0);
          
        const calculatedExpensesCost = otherExpenses.reduce((sum, exp) => 
          sum + (exp.amount || 0), 0);
        
        // Set state with fetched data
        setLaborCost(calculatedLaborCost);
        setMaterialsCost(calculatedMaterialsCost);
        setExpensesCost(calculatedExpensesCost);
        setTotalCost(calculatedLaborCost + calculatedMaterialsCost + calculatedExpensesCost);
      } catch (error) {
        console.error('Error fetching cost data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCostData();
  }, [workOrder.work_order_id]);
  
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium">Cost Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[100px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">Cost Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Labor:</span>
            <span className="font-medium">{formatCurrency(laborCost)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Materials:</span>
            <span className="font-medium">{formatCurrency(materialsCost)}</span>
          </div>
          {expensesCost > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Other Expenses:</span>
              <span className="font-medium">{formatCurrency(expensesCost)}</span>
            </div>
          )}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Cost:</span>
              <span className="font-bold text-[#0485ea]">{formatCurrency(totalCost)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkOrderCostSummary;
