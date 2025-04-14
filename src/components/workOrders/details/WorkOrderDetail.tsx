import { useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import PageTransition from '@/components/layout/PageTransition';
import { useWorkOrderDetail } from './hooks/useWorkOrderDetail';
import WorkOrderDetailContent from './WorkOrderDetailContent';

const WorkOrderDetail = () => {
  const { workOrderId } = useParams<{ workOrderId: string }>();
  const { workOrder, loading, customer, location, assignee, fetchWorkOrder, handleBackClick } =
    useWorkOrderDetail(workOrderId);

  return (
    <PageTransition>
      <div className="space-y-6">
        <Button variant="outline" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Work Orders
        </Button>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-14 w-full" />
            <div className="grid gap-6 md:grid-cols-3">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-48 w-full" />
          </div>
        ) : !workOrder ? (
          <Card className="py-8">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Work Order Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The work order you're looking for doesn't exist or you don't have permission to view
                it.
              </p>
              <Button onClick={handleBackClick}>Return to Work Orders</Button>
            </div>
          </Card>
        ) : (
          <WorkOrderDetailContent
            workOrder={workOrder}
            customer={customer}
            location={location}
            assignee={assignee}
            onStatusChange={fetchWorkOrder}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default WorkOrderDetail;
