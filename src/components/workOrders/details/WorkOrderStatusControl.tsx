
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WorkOrder } from '@/types/workOrder';

interface StatusTransition {
  to_status: string;
  label: string;
  description: string;
}

interface WorkOrderStatusControlProps {
  workOrder: WorkOrder;
  onStatusChange: () => void;
}

const WorkOrderStatusControl = ({ workOrder, onStatusChange }: WorkOrderStatusControlProps) => {
  const [loading, setLoading] = useState(false);
  const [statusTransitions, setStatusTransitions] = useState<StatusTransition[]>([]);

  // Fetch possible status transitions on component mount
  useState(() => {
    const fetchTransitions = async () => {
      try {
        const { data: transitionsData } = await supabase
          .rpc('get_next_possible_transitions', {
            entity_type_param: 'WORK_ORDER',
            current_status_param: workOrder.status
          });
        
        setStatusTransitions(transitionsData || []);
      } catch (error) {
        console.error('Error fetching status transitions:', error);
      }
    };
    
    fetchTransitions();
  });

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('maintenance_work_orders')
        .update({ status: newStatus })
        .eq('work_order_id', workOrder.work_order_id);
      
      if (error) {
        throw error;
      }
      
      // Log the activity
      await supabase.from('activitylog').insert({
        action: 'Status Change',
        moduletype: 'WORK_ORDER',
        referenceid: workOrder.work_order_id,
        status: newStatus,
        previousstatus: workOrder.status,
        detailsjson: JSON.stringify({
          title: workOrder.title,
          from: workOrder.status,
          to: newStatus
        })
      });
      
      toast({
        title: 'Status Updated',
        description: `Work order status changed to ${newStatus.replace('_', ' ').toLowerCase()}.`,
      });
      
      onStatusChange();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error Updating Status',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <span className="mr-2">Status:</span>
        <StatusBadge status={workOrder.status} />
      </div>
      
      {statusTransitions.length > 0 && (
        <Select onValueChange={handleStatusChange} disabled={loading}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Change status" />
          </SelectTrigger>
          <SelectContent>
            {statusTransitions.map((transition) => (
              <SelectItem key={transition.to_status} value={transition.to_status}>
                {transition.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default WorkOrderStatusControl;
