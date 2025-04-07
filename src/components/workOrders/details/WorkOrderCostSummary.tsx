import { Card, CardContent } from '@/components/ui/card';
import { WorkOrder } from '@/types/workOrder';
import { formatCurrency } from '@/lib/utils';

interface WorkOrderCostSummaryProps {
  workOrder: WorkOrder;
}

const WorkOrderCostSummary = ({ workOrder }: WorkOrderCostSummaryProps) => {
  // Calculate totals with proper null checks
  const materialsCost = workOrder.materials_cost || 0;
  
  // Labor cost is calculated from actual hours * hourly rate
  // Default hourly rate is $75 if not specified
  const laborCost = workOrder.actual_hours ? (workOrder.actual_hours * 75) : 0;
  
  // Other expenses (excluding labor and materials)
  const expensesCost = workOrder.expenses_cost || 0;
  
  // Use workOrder.total_cost if available, otherwise calculate it
  const totalCost = workOrder.total_cost || (materialsCost + laborCost + expensesCost);
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-base font-medium mb-4">Cost Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Labor:</span>
            <span className="font-medium">{formatCurrency(laborCost)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Materials:</span>
            <span className="font-medium">{formatCurrency(materialsCost)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Other Expenses:</span>
            <span className="font-medium">{formatCurrency(expensesCost)}</span>
          </div>
          
          <div className="border-t pt-2 mt-2 flex justify-between text-sm font-medium">
            <span>Total Cost:</span>
            <span className="text-[#0485ea]">{formatCurrency(totalCost)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkOrderCostSummary;
