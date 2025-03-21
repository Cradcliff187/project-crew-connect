
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign, Wrench } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/components/subcontractors/utils/formatUtils';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AssociatedWorkOrdersProps {
  workOrders: any[];
  loading: boolean;
}

const AssociatedWorkOrders: React.FC<AssociatedWorkOrdersProps> = ({ workOrders, loading }) => {
  const navigate = useNavigate();

  const handleWorkOrderClick = (workOrderId: string) => {
    navigate(`/work-orders/${workOrderId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Associated Work Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center pb-4 border-b">
              <div className="space-y-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (workOrders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Associated Work Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No work orders are associated with this subcontractor yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Associated Work Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {workOrders.map((workOrder) => (
          <div 
            key={workOrder.work_order_id} 
            className="flex justify-between items-center pb-4 border-b last:border-b-0 last:pb-0"
          >
            <div className="space-y-1">
              <h4 className="font-medium">{workOrder.title}</h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(workOrder.created_at)}
                </div>
                {workOrder.labor_cost > 0 && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="h-3 w-3 mr-1" />
                    ${workOrder.labor_cost.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={workOrder.status || 'unknown'} size="sm" />
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-8"
                onClick={() => handleWorkOrderClick(workOrder.work_order_id)}
              >
                View
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AssociatedWorkOrders;
