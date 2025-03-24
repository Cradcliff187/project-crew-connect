
import React from 'react';
import { LayoutList } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

interface WorkOrder {
  work_order_id: string;
  title: string;
  status: string;
}

interface AssociatedWorkOrdersProps {
  workOrders: WorkOrder[];
  loading: boolean;
}

const AssociatedWorkOrders = ({ workOrders, loading }: AssociatedWorkOrdersProps) => {
  const navigate = useNavigate();
  
  if (workOrders.length === 0 && !loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-montserrat font-semibold text-[#0485ea]">Work Orders</h3>
        <div className="text-muted-foreground italic">No associated work orders</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-montserrat font-semibold text-[#0485ea]">Work Orders</h3>
      <div className="grid gap-2">
        {loading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          workOrders.map((workOrder) => (
            <Card key={workOrder.work_order_id} className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <LayoutList className="h-4 w-4 text-[#0485ea] mt-0.5" />
                  <div>
                    <div className="font-medium">{workOrder.title}</div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs bg-[#f0f7fe] text-[#0485ea] border-[#dcedfd]">
                        {workOrder.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/workorders/${workOrder.work_order_id}`)}
                >
                  View Work Order
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AssociatedWorkOrders;
