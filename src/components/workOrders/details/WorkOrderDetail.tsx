import { useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
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

  // Show a clean loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={handleBackClick} disabled>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Work Orders
        </Button>

        <div className="flex justify-center items-center mt-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#0485ea]" />
            <p className="mt-4 text-muted-foreground">Loading work order details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if work order not found
  if (!workOrder) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Work Orders
        </Button>

        <Card className="p-6">
          <div className="flex items-center gap-3 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            <div className="font-medium">Work Order Not Found</div>
          </div>
          <p className="mt-2 text-muted-foreground">
            The work order you are looking for does not exist or has been deleted.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <Button variant="outline" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Work Orders
        </Button>

        <WorkOrderDetailContent
          workOrder={workOrder}
          customer={customer}
          location={location}
          assignee={assignee}
          onStatusChange={fetchWorkOrder}
        />
      </div>
    </PageTransition>
  );
};

export default WorkOrderDetail;
