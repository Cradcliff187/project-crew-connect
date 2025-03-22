
import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';

interface StatusOption {
  status_code: string;
  label: string;
  description: string;
}

interface WorkOrderStatusControlProps {
  workOrder: WorkOrder;
  onStatusChange: () => void;
}

const WorkOrderStatusControl = ({ workOrder, onStatusChange }: WorkOrderStatusControlProps) => {
  const [loading, setLoading] = useState(false);
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const { toast } = useToast();

  // Fetch all possible statuses when component mounts
  useEffect(() => {
    fetchStatusOptions();
  }, []);
  
  const fetchStatusOptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('status_definitions')
        .select('status_code, label, description')
        .eq('entity_type', 'WORK_ORDER');
      
      if (error) {
        console.error('Error fetching status options:', error);
        return;
      }
      
      setStatusOptions(data || []);
      console.log('Available statuses:', data);
    } catch (error) {
      console.error('Error fetching status options:', error);
    } finally {
      setLoading(false);
    }
  };
  
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
      
      // Log the activity is now handled by the database trigger automatically
      
      toast({
        title: 'Status Updated',
        description: `Work order status changed to ${newStatus.replace('_', ' ').toLowerCase()}.`,
      });
      
      onStatusChange();
    } catch (error: any) {
      console.error('Error updating status:', error);
      
      let errorMessage = 'Failed to update work order status. Please try again.';
      
      if (error.message) {
        if (error.code === '401' || error.code === 401 || error.message.includes('auth') || error.message.includes('API key')) {
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
      
    } finally {
      setLoading(false);
    }
  };

  const getStatusActions = (): ActionGroup[] => {
    return [
      {
        items: statusOptions
          .filter(option => option.status_code !== workOrder.status) // Don't show current status
          .map((option) => ({
            label: option.label || option.status_code,
            icon: <Edit className="w-4 h-4" />,
            onClick: () => handleStatusChange(option.status_code),
            disabled: loading
          }))
      }
    ];
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
      <div className="flex items-center">
        <span className="mr-2 text-sm font-medium">Status:</span>
        <StatusBadge status={workOrder.status} />
      </div>
      
      {statusOptions.length > 0 ? (
        <div className="flex gap-2 mt-2 md:mt-0">
          {/* Mobile view */}
          <div className="md:hidden">
            <ActionMenu 
              groups={getStatusActions()} 
              size="sm" 
              variant="outline"
              triggerClassName="bg-muted/50 border border-input hover:bg-[#0485ea]/10"
            />
          </div>
          
          {/* Desktop view */}
          <div className="hidden md:block">
            <Select onValueChange={handleStatusChange} disabled={loading}>
              <SelectTrigger className="w-[180px] border-[#0485ea]/30 hover:border-[#0485ea] focus:ring-[#0485ea]/20 bg-white">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions
                  .filter(option => option.status_code !== workOrder.status) // Don't show current status
                  .map((option) => (
                    <SelectItem key={option.status_code} value={option.status_code}>
                      {option.label || option.status_code}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="ml-0 md:ml-2 mt-2 md:mt-0 text-sm border-[#0485ea]/30 hover:border-[#0485ea] hover:bg-[#0485ea]/10"
          onClick={fetchStatusOptions}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh Status Options"}
        </Button>
      )}
    </div>
  );
};

export default WorkOrderStatusControl;
