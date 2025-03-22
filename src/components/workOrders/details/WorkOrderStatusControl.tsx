
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
import { Command, CommandGroup, CommandItem } from '@/components/ui/command';

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
      console.log('Fetching status options from Supabase');
      
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
        return;
      }
      
      // Ensure we have a valid array of options, even if data is null or undefined
      const validOptions = Array.isArray(data) ? data : [];
      setStatusOptions(validOptions);
      console.log('Available statuses:', validOptions);
    } catch (error: any) {
      console.error('Error fetching status options:', error);
      toast({
        title: 'Error loading statuses',
        description: 'Could not load available statuses. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (newStatus: string) => {
    // If the status hasn't changed, just close the popover and return
    if (newStatus === workOrder.status) {
      setOpen(false);
      return;
    }
    
    setLoading(true);
    
    try {
      console.log(`Updating work order ${workOrder.work_order_id} status to ${newStatus}`);
      
      // Update the work order status in the database
      const { error } = await supabase
        .from('maintenance_work_orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('work_order_id', workOrder.work_order_id);
      
      if (error) {
        throw error;
      }
      
      // Show success message
      toast({
        title: 'Status Updated',
        description: `Work order status changed to ${getStatusLabel(newStatus).toLowerCase()}.`,
        className: 'bg-[#0485ea]',
      });
      
      // Close the popover and trigger the onStatusChange callback
      setOpen(false);
      onStatusChange();
    } catch (error: any) {
      console.error('Error updating status:', error);
      
      let errorMessage = 'Failed to update work order status. Please try again.';
      
      if (error.message) {
        if (error.code === '401' || error.code === 401 || error.message.includes('auth') || error.message.includes('API key')) {
          errorMessage = 'Authentication error. Your session may have expired. Please refresh the page and try again.';
        } else if (error.code === '23514' || error.message.includes('violates row level security')) {
          errorMessage = 'Permission denied. You do not have permission to update this work order status.';
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

  // Render a safer version that ensures statusOptions is always an array
  return (
    <div className="flex items-center relative z-10">
      <span className="mr-2 text-sm font-medium">Status:</span>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button 
            className="flex items-center cursor-pointer gap-1 hover:bg-accent p-1 rounded transition-colors"
            disabled={loading || statusOptions.length === 0}
            aria-label="Change status"
          >
            <StatusBadge status={workOrder.status} />
            <ChevronDown className="h-4 w-4 ml-1 text-primary" />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 w-[220px] bg-popover border border-border shadow-md" 
          align="start"
          sideOffset={5}
        >
          {/* Only render Command component when we have status options */}
          {statusOptions.length > 0 ? (
            <Command className="rounded-md overflow-hidden">
              <CommandGroup>
                {statusOptions.map((option) => (
                  <CommandItem
                    key={option.status_code}
                    value={option.status_code}
                    onSelect={() => handleStatusChange(option.status_code)}
                    className="flex items-center cursor-pointer hover:bg-accent transition-colors px-3 py-2"
                    disabled={loading}
                  >
                    <div className="flex items-center w-full">
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 flex-shrink-0",
                          option.status_code === workOrder.status ? "opacity-100 text-primary" : "opacity-0"
                        )}
                      />
                      <span className="text-sm">{option.label || option.status_code}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          ) : (
            <div className="py-4 px-2 text-center text-sm text-muted-foreground">
              {loading ? 'Loading statuses...' : 'No status options available'}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default WorkOrderStatusControl;
