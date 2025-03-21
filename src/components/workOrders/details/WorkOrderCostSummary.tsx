
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Package, Clock, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';
import { formatCurrency } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

interface WorkOrderCostSummaryProps {
  workOrder: WorkOrder;
  onAddTimeLog?: () => void;
}

const WorkOrderCostSummary = ({ workOrder, onAddTimeLog }: WorkOrderCostSummaryProps) => {
  const [materialsTotal, setMaterialsTotal] = useState<number | null>(null);
  const [laborTotal, setLaborTotal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLogCount, setTimeLogCount] = useState(0);
  const queryClient = useQueryClient();
  
  const fetchCostData = async () => {
    setIsLoading(true);
    try {
      // Fetch materials total
      const { data: materialsData, error: materialsError } = await supabase
        .from('work_order_materials')
        .select('total_price')
        .eq('work_order_id', workOrder.work_order_id);
        
      if (materialsError) {
        console.error('Error fetching materials:', materialsError);
      } else {
        const total = (materialsData || []).reduce((sum, item) => sum + (item.total_price || 0), 0);
        setMaterialsTotal(total);
      }
      
      // Fetch labor total and time log count
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
        setTimeLogCount(laborData?.length || 0);
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
  
  // Handle the button click to log time
  const handleLogTimeClick = () => {
    if (onAddTimeLog) {
      onAddTimeLog();
    }
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Cost Summary</h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <div className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>Materials Cost</span>
              </div>
              <span className="font-medium">{formatCurrency(materialsTotal || 0)}</span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>Labor Cost ({workOrder.actual_hours || 0} hours)</span>
              </div>
              <span className="font-medium">{formatCurrency(laborTotal || 0)}</span>
            </div>
            
            <div className="flex justify-between items-center pt-2 text-lg font-bold">
              <span>Total Cost</span>
              <span className="text-[#0485ea]">{formatCurrency(workOrder.total_cost || 0)}</span>
            </div>
          </div>
        )}
        
        <Separator className="my-6" />
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Time Logs</h3>
          
          {/* Button to add time log */}
          <Button 
            variant="outline" 
            className="text-[#0485ea] mb-4"
            onClick={handleLogTimeClick}
          >
            <Plus className="h-4 w-4 mr-1" />
            Log Time
          </Button>
          
          {/* Time logs summary */}
          <div className="text-center py-6 border rounded-md">
            <Clock className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {timeLogCount > 0 
                ? `${timeLogCount} time ${timeLogCount === 1 ? 'entry' : 'entries'} recorded` 
                : 'No time logs recorded yet'}
            </p>
            <p className="text-sm mt-1">Total: {workOrder.actual_hours || 0} hours</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkOrderCostSummary;
