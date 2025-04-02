
import { WorkOrder } from '@/types/workOrder';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import UniversalStatusControl from '@/components/common/status/UniversalStatusControl';

interface WorkOrderStatusControlProps {
  workOrder: WorkOrder;
  onStatusChange: () => void;
}

const WorkOrderStatusControl = ({ workOrder, onStatusChange }: WorkOrderStatusControlProps) => {
  const { statusOptions } = useStatusOptions('WORK_ORDER', workOrder.status);
  
  const getAdditionalUpdateFields = (newStatus: string) => {
    const updateFields: Record<string, any> = {};
    
    // If the status is COMPLETED, the progress will be set to 100 by the universal component
    if (newStatus === 'COMPLETED') {
      updateFields.progress = 100;
    }
    
    return updateFields;
  };
  
  return (
    <div className="flex items-center relative z-10">
      <span className="mr-2 text-sm font-medium">Status:</span>
      
      <UniversalStatusControl 
        entityId={workOrder.work_order_id}
        entityType="WORK_ORDER"
        currentStatus={workOrder.status}
        statusOptions={statusOptions}
        tableName="maintenance_work_orders"
        idField="work_order_id"
        onStatusChange={onStatusChange}
        additionalUpdateFields={getAdditionalUpdateFields}
        size="sm"
        showStatusBadge={true}
      />
    </div>
  );
};

export default WorkOrderStatusControl;
