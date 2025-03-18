
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { WorkOrder } from '@/types/workOrder';
import WorkOrderDetails from './WorkOrderDetails';
import WorkOrderTimelogs from './WorkOrderTimelogs';
import WorkOrderMaterials from './WorkOrderMaterials';
import WorkOrderDocuments from './WorkOrderDocuments';

interface WorkOrderDetailDialogProps {
  workOrder: WorkOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: () => void;
}

const WorkOrderDetailDialog = ({ 
  workOrder, 
  open, 
  onOpenChange,
  onStatusChange
}: WorkOrderDetailDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <Tabs defaultValue="details" className="mt-2">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="timelogs">Time Logs</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <WorkOrderDetails workOrder={workOrder} onStatusChange={onStatusChange} />
          </TabsContent>
          
          <TabsContent value="timelogs">
            <WorkOrderTimelogs workOrderId={workOrder.work_order_id} />
          </TabsContent>
          
          <TabsContent value="materials">
            <WorkOrderMaterials workOrderId={workOrder.work_order_id} />
          </TabsContent>
          
          <TabsContent value="documents">
            <WorkOrderDocuments workOrderId={workOrder.work_order_id} entityType="WORK_ORDER" />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default WorkOrderDetailDialog;
