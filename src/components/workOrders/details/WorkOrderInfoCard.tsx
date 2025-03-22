
import { Clock, AlertCircle, Calendar, DollarSign, Hash, CalendarClock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { WorkOrder } from '@/types/workOrder';
import { formatDate, formatCurrency } from '@/lib/utils';

interface WorkOrderInfoCardProps {
  workOrder: WorkOrder;
}

const WorkOrderInfoCard = ({ workOrder }: WorkOrderInfoCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {workOrder.work_order_number && (
            <div className="flex items-start">
              <Hash className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Work Order Number</p>
                <p className="text-sm text-muted-foreground">
                  {workOrder.work_order_number}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">Priority</p>
              <p className="text-sm text-muted-foreground capitalize">
                {workOrder.priority?.toLowerCase() || 'Medium'}
              </p>
            </div>
          </div>
          
          {workOrder.scheduled_date && (
            <div className="flex items-start">
              <Calendar className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Scheduled Date</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(workOrder.scheduled_date)}
                </p>
              </div>
            </div>
          )}
          
          {workOrder.due_by_date && (
            <div className="flex items-start">
              <CalendarClock className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Due By Date</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(workOrder.due_by_date)}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-start">
            <Clock className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">Time</p>
              <p className="text-sm text-muted-foreground">
                {workOrder.time_estimate ? `Estimated: ${workOrder.time_estimate} hours` : 'No estimate'} 
                {workOrder.actual_hours ? ` • Actual: ${workOrder.actual_hours} hours` : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <DollarSign className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">Costs</p>
              <p className="text-sm text-muted-foreground">
                {workOrder.materials_cost ? `Materials: ${formatCurrency(workOrder.materials_cost)}` : 'No materials'} 
                {workOrder.total_cost ? ` • Total: ${formatCurrency(workOrder.total_cost)}` : ''}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkOrderInfoCard;
