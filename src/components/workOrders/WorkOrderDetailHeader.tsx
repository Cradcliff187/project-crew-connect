
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import WorkOrderStatusControl from './status/WorkOrderStatusControl';

interface WorkOrderDetailHeaderProps {
  workOrder: WorkOrder;
  onStatusChange: () => void;
}

const WorkOrderDetailHeader: React.FC<WorkOrderDetailHeaderProps> = ({
  workOrder,
  onStatusChange
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">{workOrder.title}</h1>
        <p className="text-sm text-muted-foreground">
          Work Order #{workOrder.work_order_number || workOrder.id?.substring(0, 8)}
        </p>
      </div>
      
      <WorkOrderStatusControl 
        workOrder={workOrder}
        onStatusChange={onStatusChange}
      />
    </div>
  );
};

export default WorkOrderDetailHeader;
