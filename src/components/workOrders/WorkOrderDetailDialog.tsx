
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, Clock, Package, FileText } from 'lucide-react';
import { WorkOrder } from '@/types/workOrder';
import WorkOrderDetails from './WorkOrderDetails';
import WorkOrderTimelogs from './WorkOrderTimelogs';
import WorkOrderMaterials from './WorkOrderMaterials';
import WorkOrderDocuments from './WorkOrderDocuments';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [activeTab, setActiveTab] = useState('details');
  const isMobile = useIsMobile();
  
  // Reset to details tab when opening a different work order
  useEffect(() => {
    if (open) {
      setActiveTab('details');
    }
  }, [workOrder.work_order_id, open]);
  
  // Function to handle any updates to the work order
  const handleWorkOrderUpdate = () => {
    onStatusChange();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? "max-w-[95vw] p-3 h-[90vh]" : "max-w-[900px] h-[80vh]"}>
        <DialogHeader>
          <DialogTitle>Work Order: {workOrder.title}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="details" className="flex items-center">
              <ClipboardList className="h-4 w-4 mr-2" />
              <span className={isMobile ? "hidden" : "inline"}>Details</span>
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span className={isMobile ? "hidden" : "inline"}>Time</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center">
              <Package className="h-4 w-4 mr-2" />
              <span className={isMobile ? "hidden" : "inline"}>Materials</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              <span className={isMobile ? "hidden" : "inline"}>Documents</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-auto mt-4">
            <TabsContent value="details" className="h-full">
              <WorkOrderDetails 
                workOrder={workOrder} 
                onStatusChange={handleWorkOrderUpdate} 
              />
            </TabsContent>
            
            <TabsContent value="time" className="h-full">
              <WorkOrderTimelogs 
                workOrderId={workOrder.work_order_id} 
                onTimeLogAdded={handleWorkOrderUpdate}
              />
            </TabsContent>
            
            <TabsContent value="materials" className="h-full">
              <WorkOrderMaterials 
                workOrderId={workOrder.work_order_id} 
                onMaterialAdded={handleWorkOrderUpdate}
              />
            </TabsContent>
            
            <TabsContent value="documents" className="h-full">
              <WorkOrderDocuments 
                workOrderId={workOrder.work_order_id} 
                entityType="WORK_ORDER"
                onDocumentAdded={handleWorkOrderUpdate}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default WorkOrderDetailDialog;
