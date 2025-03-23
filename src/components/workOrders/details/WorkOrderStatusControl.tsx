
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronDown } from 'lucide-react';
import { WorkOrder } from '@/types/workOrder';
import { cn } from '@/lib/utils';

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
  const [open, setOpen] = useState(false);
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
        toast({
          title: 'Error loading statuses',
          description: 'Could not load available statuses. Please try again.',
          variant: 'destructive',
        });
        setStatusOptions([]);
        return;
      }
      
      setStatusOptions(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching status options:', error);
      toast({
        title: 'Error loading statuses',
        description: 'Could not load available statuses. Please try again.',
        variant: 'destructive',
      });
      setStatusOptions([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (newStatus: string) => {
    try {
      // If the status hasn't changed, just close the popover and return
      if (newStatus === workOrder.status) {
        setOpen(false);
        return;
      }
      
      setLoading(true);
      console.log(`Updating work order ${workOrder.work_order_id} status to ${newStatus}`);
      
      // Disable triggers temporarily (to avoid activitylog insert)
      // We'll directly update the status without going through the trigger that inserts into activitylog
      const { error } = await supabase.rpc('update_work_order_status_bypass_log', {
        p_work_order_id: workOrder.work_order_id,
        p_status: newStatus
      });
      
      if (error) {
        throw error;
      }
      
      // Show success message with the new status label
      const statusLabel = getStatusLabel(newStatus);
      toast({
        title: 'Status Updated',
        description: `Work order status changed to ${statusLabel.toLowerCase()}.`,
        className: 'bg-[#0485ea]',
      });
      
      // Close the popover and trigger the onStatusChange callback
      setOpen(false);
      onStatusChange();
    } catch (error: any) {
      console.error('Error updating status:', error);
      
      toast({
        title: 'Error Updating Status',
        description: error.message || 'Failed to update work order status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get a user-friendly status label
  const getStatusLabel = (statusCode: string): string => {
    const option = statusOptions.find(opt => opt.status_code === statusCode);
    
    if (option?.label) {
      return option.label;
    }
    
    // Fallback to formatting the status code
    return statusCode
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Ensure we have a valid status to display (use lowercase 'new' as fallback)
  const currentStatus = workOrder.status || 'new';
  
  return (
    <div className="flex items-center relative z-10">
      <span className="mr-2 text-sm font-medium">Status:</span>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button 
            className="flex items-center gap-1 hover:bg-accent/50 p-1 rounded transition-colors relative"
            disabled={loading}
            aria-label="Change status"
          >
            <StatusBadge status={currentStatus} />
            <ChevronDown className="h-4 w-4 ml-1 text-primary" />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 w-[220px] bg-popover border border-border shadow-md" 
          align="start"
          sideOffset={5}
        >
          {loading ? (
            <div className="py-4 px-2 text-center text-sm text-muted-foreground">
              Loading statuses...
            </div>
          ) : statusOptions.length > 0 ? (
            <div className="overflow-hidden py-1">
              {statusOptions.map((option) => (
                <button
                  key={option.status_code}
                  onClick={() => handleStatusChange(option.status_code)}
                  className="flex items-center w-full hover:bg-accent px-3 py-2 text-left cursor-pointer transition-colors"
                  disabled={loading}
                >
                  <div className="flex items-center w-full">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 flex-shrink-0",
                        option.status_code === currentStatus ? "opacity-100 text-primary" : "opacity-0"
                      )}
                    />
                    <span className="text-sm">{option.label || option.status_code}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-4 px-2 text-center text-sm text-muted-foreground">
              No status options available
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default WorkOrderStatusControl;
