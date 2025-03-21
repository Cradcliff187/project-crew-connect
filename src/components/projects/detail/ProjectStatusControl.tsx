
import { useState } from 'react';
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
  const { toast } = useToast();
  
  const statuses = {
    new: ['active', 'cancelled'],
    active: ['completed', 'on_hold', 'cancelled'],
    on_hold: ['active', 'cancelled'],
    completed: ['active'],
    cancelled: ['active'],
  };
  
  const statusLabels = {
    new: 'New',
    active: 'Active',
    on_hold: 'On Hold',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  
  const availableStatuses = statuses[project.status.toLowerCase() as keyof typeof statuses] || [];
  
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
        description: `Project status changed to ${statusLabels[newStatus as keyof typeof statusLabels]}.`,
      });
      
      // Call the onStatusChange callback to refresh project data
      onStatusChange();
    } catch (error: any) {
      console.error('Error updating project status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project status. Please try again.',
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
            {availableStatuses.map((status) => (
              <DropdownMenuItem 
                key={status}
                onClick={() => handleStatusChange(status)}
                className="cursor-pointer"
              >
                {status === 'active' && <Check className="mr-2 h-4 w-4 text-green-500" />}
                {status === 'on_hold' && <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />}
                {statusLabels[status as keyof typeof statusLabels]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default ProjectStatusControl;
