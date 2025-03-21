
import { useState, useEffect, useCallback } from 'react';
import { Check, AlertCircle, Info } from 'lucide-react';
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
import { statusOptions, statusTransitions } from '../ProjectConstants';

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
  
  // Create a memoized fetchAvailableTransitions function
  const fetchAvailableTransitions = useCallback(async () => {
    try {
      const currentStatus = project.status.toLowerCase();
      console.log(`Fetching transitions for project status: ${currentStatus}`);
      
      // First try to get transitions from the database
      const { data, error } = await supabase
        .from('status_transitions')
        .select('to_status, label, description')
        .eq('entity_type', 'PROJECT')
        .eq('from_status', currentStatus);

      if (error) {
        console.error('Error fetching transitions:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log('Transitions fetched successfully:', data);
        const formattedTransitions = data.map((transition: any) => ({
          status: transition.to_status,
          label: transition.label || statusLabels[transition.to_status] || transition.to_status,
        }));
        setAvailableStatuses(formattedTransitions);
      } else {
        console.warn('No status transitions found in database for status:', currentStatus);
        // Fall back to static transitions
        useStaticTransitions(currentStatus);
      }
    } catch (error) {
      console.error('Failed to fetch transitions:', error);
      // Fall back to static transitions on error
      useStaticTransitions(project.status.toLowerCase());
    }
  }, [project.status]);
  
  // Helper function to use static transitions from ProjectConstants
  const useStaticTransitions = (currentStatus: string) => {
    const fallbackTransitions = statusTransitions[currentStatus] || [];
    console.log('Using static fallback transitions:', fallbackTransitions);
    
    const formattedTransitions = fallbackTransitions.map(status => ({
      status,
      label: statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1)
    }));
    
    setAvailableStatuses(formattedTransitions);
    
    toast({
      title: 'Using default transitions',
      description: 'Could not fetch transitions from database, using defaults.',
      variant: 'default',
    });
  };
  
  // Fetch available status transitions when the project status changes
  useEffect(() => {
    fetchAvailableTransitions();
  }, [project.status, fetchAvailableTransitions]);
  
  const handleStatusChange = async (newStatus: string) => {
    if (project.status === newStatus) {
      toast({
        title: 'Status unchanged',
        description: `Project is already ${statusLabels[newStatus] || newStatus}.`,
      });
      return;
    }
    
    setUpdating(true);
    try {
      console.log(`Updating project status from ${project.status} to ${newStatus}`);
      
      const { error } = await supabase
        .from('projects')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('projectid', project.projectid);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Status updated',
        description: `Project status changed to ${statusLabels[newStatus] || newStatus}.`,
      });
      
      // Call the onStatusChange callback to refresh project data
      onStatusChange();
    } catch (error: any) {
      console.error('Error updating project status:', error);
      
      let errorMessage = 'Failed to update project status. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Invalid status transition')) {
          errorMessage = `Status change not allowed: ${error.message}`;
        } else if (error.message.includes('No API key found')) {
          errorMessage = 'Authentication error. Please refresh the page and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Refresh transitions after error
      fetchAvailableTransitions();
    } finally {
      setUpdating(false);
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <StatusBadge status={mapStatusToStatusBadge(project.status)} />
      
      {availableStatuses.length > 0 ? (
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
      ) : (
        <div className="flex items-center ml-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4 mr-1" />
          No status changes available
        </div>
      )}
    </div>
  );
};

export default ProjectStatusControl;
