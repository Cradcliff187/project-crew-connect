
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';
import { formatCurrency } from '@/lib/utils';

interface WorkOrderCostSummaryProps {
  workOrder: WorkOrder;
}

const WorkOrderCostSummary = ({ workOrder }: WorkOrderCostSummaryProps) => {
  const [materialsTotal, setMaterialsTotal] = useState<number | null>(null);
  const [laborTotal, setLaborTotal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [materialCount, setMaterialCount] = useState(0);
  
  const fetchCostData = async () => {
    setIsLoading(true);
    try {
      // Fetch expenses total (materials + time entry expenses)
      const { data: expensesData, error: expensesError, count } = await supabase
        .from('unified_work_order_expenses')
        .select('total_price', { count: 'exact' })
        .eq('work_order_id', workOrder.work_order_id);
        
      if (expensesError) {
        console.error('Error fetching expenses:', expensesError);
      } else {
        const total = (expensesData || []).reduce((sum, item) => sum + (item.total_price || 0), 0);
        setMaterialsTotal(total);
        setMaterialCount(count || 0);
      }
      
      // Fetch labor total
      const { data: laborData, error: laborError } = await supabase
        .from('work_order_time_logs')
        .select('hours_worked')
        .eq('work_order_id', workOrder.work_order_id);
        
      if (laborError) {
        console.error('Error fetching labor:', laborError);
      } else {
        // Calculate based on a default rate of $75/hour as per database function
        const hours = (laborData || []).reduce((sum, item) => sum + (item.hours_worked || 0), 0);
        setLaborTotal(hours * 75);
      }
    } catch (error) {
      console.error('Error fetching cost data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCostData();
  }, [workOrder.work_order_id]);
  
  // Calculate the total cost - use our fetched data instead of relying on workOrder.total_cost
  const calculatedTotalCost = (laborTotal || 0) + (materialsTotal || 0);
  
  // Detect discrepancy between calculated and stored totals
  const hasCostDiscrepancy = calculatedTotalCost !== (workOrder.total_cost || 0);
  
  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="text-lg font-semibold mb-4">Cost Summary</h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Materials Cost ({materialCount} items)</span>
              <span className="font-medium">{formatCurrency(materialsTotal || 0)}</span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Labor Cost ({workOrder.actual_hours || 0} hours)</span>
              <span className="font-medium">{formatCurrency(laborTotal || 0)}</span>
            </div>
            
            <div className="flex justify-between items-center pt-2 text-lg font-bold">
              <span>Total Cost</span>
              <span className="text-[#0485ea]">{formatCurrency(calculatedTotalCost)}</span>
            </div>
            
            {hasCostDiscrepancy && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                <p>The displayed costs reflect the current materials and labor.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkOrderCostSummary;
