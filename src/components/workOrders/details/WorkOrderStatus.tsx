
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
        return 'bg-sage-100 text-sage-800 border-sage-200';
      case 'in_progress':
        return 'bg-construction-100 text-construction-800 border-construction-200';
      case 'on_hold':
        return 'bg-earth-100 text-earth-800 border-earth-200';
      case 'new':
        return 'bg-warmgray-100 text-warmgray-800 border-warmgray-200';
      default:
        return 'bg-secondary text-secondary-foreground border-secondary';
    }
  };

  return (
    <Badge className={`text-xs px-2 py-1 ${getStatusColor(workOrder.status)}`}>
      {workOrder.status.replace('_', ' ')}
    </Badge>
  );
};

export default WorkOrderStatus;
