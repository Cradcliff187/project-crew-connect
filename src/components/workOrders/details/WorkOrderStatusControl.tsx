
import { useState, useEffect, useCallback } from 'react';
import { Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';

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
  const { toast } = useToast();

  // Fetch possible status transitions when component mounts
  const fetchTransitions = useCallback(async () => {
    try {
      // Use fully qualified function call with explicit headers
      const { data: transitionsData, error } = await supabase
        .rpc('get_next_possible_transitions', {
          entity_type_param: 'WORK_ORDER',
          current_status_param: workOrder.status
        });
      
      if (error) {
        console.error('Error fetching status transitions:', error);
        return;
      }
      
      setStatusTransitions(transitionsData || []);
    } catch (error) {
      console.error('Error fetching status transitions:', error);
    }
  }, [workOrder.status]);
  
  useEffect(() => {
    fetchTransitions();
  }, [workOrder.status, fetchTransitions]);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === workOrder.status) {
      toast({
        title: 'Status unchanged',
        description: `Work order is already in ${newStatus.replace('_', ' ')} status.`,
      });
      return;
    }
    
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
      
      let errorMessage = 'Failed to update work order status. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Invalid status transition')) {
          errorMessage = `Status change not allowed: ${error.message}`;
        } else if (error.code === '401' || error.code === 401 || error.message.includes('auth') || error.message.includes('API key')) {
          errorMessage = 'Authentication error. Your session may have expired. Please refresh the page and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Error Updating Status',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Refresh transitions after error
      fetchTransitions();
    } finally {
      setLoading(false);
    }
  };

  const getStatusActions = (): ActionGroup[] => {
    return [
      {
        items: statusTransitions.map((transition) => ({
          label: transition.label,
          icon: <Edit className="w-4 h-4" />,
          onClick: () => handleStatusChange(transition.to_status),
          disabled: loading
        }))
      }
    ];
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <span className="mr-2">Status:</span>
        <StatusBadge status={workOrder.status} />
      </div>
      
      {statusTransitions.length > 0 && (
        <>
          {/* Mobile and simplified view */}
          <div className="md:hidden">
            <ActionMenu 
              groups={getStatusActions()} 
              size="sm" 
              variant="outline"
              triggerClassName="bg-muted/50 border border-input hover:bg-[#0485ea]/10"
            />
          </div>
          
          {/* Desktop view with Select component */}
          <div className="hidden md:block">
            <Select onValueChange={handleStatusChange} disabled={loading}>
              <SelectTrigger className="w-[180px] border-[#0485ea]/30 hover:border-[#0485ea] focus:ring-[#0485ea]/20">
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
          </div>
        </>
      )}
    </div>
  );
};

export default WorkOrderStatusControl;
