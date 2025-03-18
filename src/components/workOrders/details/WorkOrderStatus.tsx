
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { WorkOrder } from '@/types/workOrder';

interface WorkOrderStatusProps {
  workOrder: WorkOrder;
  onStatusChange?: (newStatus: string) => void;
}

const WorkOrderStatus: React.FC<WorkOrderStatusProps> = ({ 
  workOrder, 
  onStatusChange 
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'on_hold':
        return 'bg-amber-100 text-amber-800';
      case 'new':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Badge className={`text-xs px-2 py-1 ${getStatusColor(workOrder.status)}`}>
      {workOrder.status.replace('_', ' ')}
    </Badge>
  );
};

export default WorkOrderStatus;
