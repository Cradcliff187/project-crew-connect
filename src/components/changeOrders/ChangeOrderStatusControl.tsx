import React, { useCallback } from 'react';
import { ChangeOrderStatus, ChangeOrderEntityType } from '@/types/changeOrders';
import UniversalStatusControl, {
  StatusOption,
} from '@/components/common/status/UniversalStatusControl';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  applyChangeOrderImpact,
  revertChangeOrderImpact,
} from '@/services/changeOrderImpactService';

interface ChangeOrderStatusControlProps {
  changeOrderId: string;
  currentStatus: ChangeOrderStatus;
  onStatusChange: () => void;
  statusOptions: StatusOption[];
  className?: string;
}

const ChangeOrderStatusControl: React.FC<ChangeOrderStatusControlProps> = ({
  changeOrderId,
  currentStatus,
  onStatusChange,
  statusOptions,
  className,
}) => {
  // Handle status-specific actions after the status is updated
  const handleAfterStatusChange = useCallback(
    async (newStatus: string) => {
      try {
        // Get the full change order details
        const { data: changeOrderData, error } = await supabase
          .from('change_orders')
          .select('*, items:change_order_items(*)')
          .eq('id', changeOrderId)
          .single();

        if (error) throw error;

        // Convert string entity_type to ChangeOrderEntityType for type safety
        // Also convert status to ChangeOrderStatus
        const changeOrder = {
          ...changeOrderData,
          entity_type: changeOrderData.entity_type as ChangeOrderEntityType,
          status: changeOrderData.status as ChangeOrderStatus,
        };

        // Apply impacts when status changes to APPROVED or IMPLEMENTED
        if (newStatus === 'APPROVED' || newStatus === 'IMPLEMENTED') {
          await applyChangeOrderImpact(changeOrder);
        }

        // Revert impacts when status changes to REJECTED or CANCELLED
        if (newStatus === 'REJECTED' || newStatus === 'CANCELLED') {
          await revertChangeOrderImpact(changeOrder);
        }

        // Call the parent's onStatusChange callback to refresh data
        if (onStatusChange) onStatusChange();
      } catch (error: any) {
        console.error('Error processing change order status change:', error);
        toast({
          title: 'Error',
          description: 'Failed to process change order status update',
          variant: 'destructive',
        });
      }
    },
    [changeOrderId, onStatusChange]
  );

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
        onAfterStatusChange={handleAfterStatusChange}
        recordHistory={true}
        size="md"
        showStatusBadge={true}
      />
    </div>
  );
};

export default ChangeOrderStatusControl;
