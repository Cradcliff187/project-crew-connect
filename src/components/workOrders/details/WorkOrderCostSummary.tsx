
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { WorkOrder } from '@/types/workOrder';
import { DollarSign, Clock, Timer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WorkOrderCostSummaryProps {
  workOrder: WorkOrder;
}

export const WorkOrderCostSummary = ({ workOrder }: WorkOrderCostSummaryProps) => {
  const [totalTimeEntryHours, setTotalTimeEntryHours] = useState(0);
  const { hours } = useFetchTimeEntryHours(workOrder.work_order_id);
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-[#0485ea]/5 pb-2">
        <CardTitle className="text-base font-medium">Cost Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 grid gap-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span>Estimated Time</span>
          </div>
          <span className="font-medium">{workOrder.time_estimate || 0} hrs</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-muted-foreground">
            <Timer className="mr-2 h-4 w-4" />
            <span>Actual Time</span>
          </div>
          <span className="font-medium">{workOrder.actual_hours || 0} hrs</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-muted-foreground">
            <DollarSign className="mr-2 h-4 w-4" />
            <span>Materials Cost</span>
          </div>
          <span className="font-medium">{formatCurrency(workOrder.materials_cost)}</span>
        </div>
        
        <div className="h-px bg-border my-1"></div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center font-medium">
            <DollarSign className="mr-2 h-5 w-5 text-[#0485ea]" />
            <span>Total Cost</span>
          </div>
          <span className="font-bold text-lg">{formatCurrency(workOrder.total_cost)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkOrderCostSummary;

// Helper hook to fetch time entry hours
function useFetchTimeEntryHours(workOrderId: string) {
  const [hours, setHours] = useState(0);
  
  useEffect(() => {
    const fetchTimeEntryHours = async () => {
      try {
        const { data, error } = await supabase
          .from('work_order_time_logs')
          .select('hours_worked')
          .eq('work_order_id', workOrderId);
        
        if (error) throw error;
        
        const totalHours = data?.reduce((sum: number, entry: any) => sum + (entry.hours_worked || 0), 0) || 0;
        setHours(totalHours);
      } catch (error) {
        console.error('Error fetching time entry hours:', error);
      }
    };
    
    if (workOrderId) {
      fetchTimeEntryHours();
    }
  }, [workOrderId]);
  
  return { hours };
}
