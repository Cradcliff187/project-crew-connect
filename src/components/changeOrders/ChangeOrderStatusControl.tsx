
import React from 'react';
import { ChangeOrderStatus } from '@/types/changeOrders';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import UniversalStatusControl, { StatusOption } from '@/components/common/status/UniversalStatusControl';

interface ChangeOrderStatusControlProps {
  changeOrderId: string;
  currentStatus: ChangeOrderStatus;
  onStatusChange: () => void;
  className?: string;
}

const ChangeOrderStatusControl: React.FC<ChangeOrderStatusControlProps> = ({
  changeOrderId,
  currentStatus,
  onStatusChange,
  className
}) => {
  const { statusOptions } = useStatusOptions('CHANGE_ORDER', currentStatus);
  
  return (
    <div className={className}>
      <UniversalStatusControl
        entityId={changeOrderId}
        entityType="CHANGE_ORDER"
        currentStatus={currentStatus}
        statusOptions={statusOptions}
        tableName="change_orders"
        idField="id"
        onStatusChange={onStatusChange}
        recordHistory={true}
        size="md"
        showStatusBadge={true}
      />
    </div>
  );
};

export default ChangeOrderStatusControl;
