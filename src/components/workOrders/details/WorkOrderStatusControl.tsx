
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
      
      setStatusOptions(data || []);
      console.log('Available statuses:', data);
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
    if (newStatus === workOrder.status) {
      setOpen(false);
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
      
      toast({
        title: 'Status Updated',
        description: `Work order status changed to ${getStatusLabel(newStatus).toLowerCase()}.`,
      });
      
      setOpen(false);
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
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default WorkOrderStatusControl;
