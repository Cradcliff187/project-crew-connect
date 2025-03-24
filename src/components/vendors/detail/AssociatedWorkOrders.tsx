
import React from 'react';
import { Clock, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '../utils/vendorUtils';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { VendorWorkOrder } from './types';

interface AssociatedWorkOrdersProps {
  workOrders: VendorWorkOrder[];
  loading: boolean;
}

const AssociatedWorkOrders: React.FC<AssociatedWorkOrdersProps> = ({ workOrders, loading }) => {
  const navigate = useNavigate();

  const handleWorkOrderClick = (workOrderId: string) => {
    navigate(`/work-orders/${workOrderId}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Associated Work Orders
        </h3>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between items-center pb-4 border-b">
            <div className="space-y-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (workOrders.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Associated Work Orders
        </h3>
        <div className="text-center py-6 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p>No work orders are associated with this vendor yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5" />
        Associated Work Orders
      </h3>
      <div className="space-y-4">
        {workOrders.map((workOrder) => (
          <div 
            key={workOrder.work_order_id} 
            className="flex justify-between items-center pb-4 border-b last:border-b-0 last:pb-0"
          >
            <div className="space-y-1">
              <h4 className="font-medium">{workOrder.title}</h4>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {formatDate(workOrder.created_at)}
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
      </div>
    </div>
  );
};

export default AssociatedWorkOrders;
