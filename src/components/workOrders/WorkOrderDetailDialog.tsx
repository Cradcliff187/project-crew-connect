
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WorkOrder } from '@/types/workOrder';
import WorkOrderDetails from './WorkOrderDetails';
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
  const isMobile = useIsMobile();
  
  // Function to handle any updates to the work order
  const handleWorkOrderUpdate = () => {
    onStatusChange();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? "max-w-[95vw] p-4 h-[90vh]" : "max-w-[900px] h-[80vh]"}>
        <DialogHeader>
          <DialogTitle className="text-[#0485ea]">Work Order: {workOrder.title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto mt-4">
          <WorkOrderDetails 
            workOrder={workOrder} 
            onStatusChange={handleWorkOrderUpdate} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkOrderDetailDialog;
