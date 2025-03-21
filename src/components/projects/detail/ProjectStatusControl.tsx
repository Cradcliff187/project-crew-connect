
import { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StatusBadge from '@/components/ui/StatusBadge';
import { mapStatusToStatusBadge } from '../ProjectsTable';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProjectDetails } from '../ProjectDetails';

interface ProjectStatusControlProps {
  project: ProjectDetails;
  onStatusChange: () => void;
}

const ProjectStatusControl = ({ project, onStatusChange }: ProjectStatusControlProps) => {
  const [updating, setUpdating] = useState(false);
  const [availableStatuses, setAvailableStatuses] = useState<{status: string, label: string}[]>([]);
  const { toast } = useToast();
  
  const statusLabels: Record<string, string> = {
    new: 'New',
    active: 'Active',
    on_hold: 'On Hold',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Pending',
  };
  
  // Fetch available status transitions from Supabase
  useEffect(() => {
    const fetchAvailableTransitions = async () => {
      try {
        // Use the get_next_possible_transitions RPC function
        const { data, error } = await supabase
          .rpc('get_next_possible_transitions', {
            entity_type_param: 'PROJECT',
            current_status_param: project.status.toLowerCase()
          });

        if (error) {
          console.error('Error fetching transitions:', error);
          // Fallback to static transitions based on current status
          const fallbackTransitions = getStaticTransitions(project.status.toLowerCase());
          setAvailableStatuses(fallbackTransitions);
        } else if (data && data.length > 0) {
          const formattedTransitions = data.map((transition: any) => ({
            status: transition.to_status,
            label: transition.label || statusLabels[transition.to_status] || transition.to_status,
          }));
          setAvailableStatuses(formattedTransitions);
        } else {
          // No transitions found, use fallback
          const fallbackTransitions = getStaticTransitions(project.status.toLowerCase());
          setAvailableStatuses(fallbackTransitions);
        }
      } catch (error) {
        console.error('Error in transition fetch:', error);
        // Fallback to static transitions
        const fallbackTransitions = getStaticTransitions(project.status.toLowerCase());
        setAvailableStatuses(fallbackTransitions);
      }
    };

    fetchAvailableTransitions();
  }, [project.status]);
  
  // Fallback transitions if database call fails
  const getStaticTransitions = (currentStatus: string): {status: string, label: string}[] => {
    // These are fallback transitions if the database call fails
    const staticTransitions: Record<string, string[]> = {
      new: ['active', 'cancelled'],
      active: ['on_hold', 'cancelled'], // Note: completed might require an intermediate step
      on_hold: ['active', 'cancelled'],
      completed: ['active'],
      cancelled: ['active'],
      pending: ['active', 'cancelled'],
    };
    
    const current = currentStatus.toLowerCase();
    const available = staticTransitions[current] || [];
    
    return available.map(status => ({
      status,
      label: statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1)
    }));
  };
  
  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('projectid', project.projectid);
      
      if (error) throw error;
      
      toast({
        title: 'Status updated',
        description: `Project status changed to ${statusLabels[newStatus] || newStatus}.`,
      });
      
      // Call the onStatusChange callback to refresh project data
      onStatusChange();
    } catch (error: any) {
      console.error('Error updating project status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update project status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <StatusBadge status={mapStatusToStatusBadge(project.status)} />
      
      {availableStatuses.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={updating} className="ml-2">
              {updating ? 'Updating...' : 'Change Status'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {availableStatuses.map((statusOption) => (
              <DropdownMenuItem 
                key={statusOption.status}
                onClick={() => handleStatusChange(statusOption.status)}
                className="cursor-pointer"
              >
                {statusOption.status === 'active' && <Check className="mr-2 h-4 w-4 text-green-500" />}
                {statusOption.status === 'on_hold' && <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />}
                {statusOption.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default ProjectStatusControl;
