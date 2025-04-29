import React from 'react';
import { Clock, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import StatusBadge from '@/components/common/status/StatusBadge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { VendorWorkOrder } from './types';
import { StatusType } from '@/types/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';

interface AssociatedWorkOrdersProps {
  workOrders: VendorWorkOrder[];
  loading: boolean;
}

const AssociatedWorkOrders: React.FC<AssociatedWorkOrdersProps> = ({ workOrders, loading }) => {
  const navigate = useNavigate();

  const handleWorkOrderClick = (workOrderId: string) => {
    navigate(`/work-orders/${workOrderId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
          <FileText className="h-5 w-5" />
          Associated Work Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4 pt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between items-center pb-4 border-b">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : workOrders.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No work orders are associated with this vendor yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workOrders.map(workOrder => (
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
                  <StatusBadge
                    status={(workOrder.status?.toLowerCase() || 'unknown') as StatusType}
                    size="sm"
                  />
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
        )}
      </CardContent>
    </Card>
  );
};

export default AssociatedWorkOrders;
