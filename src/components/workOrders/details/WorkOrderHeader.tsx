
import React from 'react';
import { WorkOrder } from '@/types/workOrder';

interface WorkOrderHeaderProps {
  workOrder: WorkOrder;
}

const WorkOrderHeader: React.FC<WorkOrderHeaderProps> = ({ workOrder }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-[#0485ea]">{workOrder.title}</h1>
      <p className="text-gray-600 mt-1">Work Order #{workOrder.work_order_id.substring(0, 8)}</p>
    </div>
  );
};

export default WorkOrderHeader;
