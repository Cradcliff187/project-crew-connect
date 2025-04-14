import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseStatusUpdateProps {
  projectId: string;
  currentStatus: string;
  onStatusChange: () => void;
  refreshTransitions: () => Promise<void>;
}

export const useStatusUpdate = ({
  projectId,
  currentStatus,
  onStatusChange,
  refreshTransitions,
}: UseStatusUpdateProps) => {
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const statusLabels: Record<string, string> = {
    new: 'New',
    active: 'Active',
    on_hold: 'On Hold',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Pending',
  };

  const updateStatus = async (newStatus: string) => {
    // Normalize both statuses to lowercase for comparison
    const normalizedCurrentStatus = currentStatus?.toLowerCase();
    const normalizedNewStatus = newStatus?.toLowerCase();

    if (!normalizedCurrentStatus || !normalizedNewStatus) {
      toast({
        title: 'Error',
        description: 'Invalid status values provided',
        variant: 'destructive',
      });
      return;
    }

    if (normalizedCurrentStatus === normalizedNewStatus) {
      toast({
        title: 'Status unchanged',
        description: `Project is already ${statusLabels[normalizedNewStatus] || newStatus}.`,
      });
      return;
    }

    // Validate project ID format
    if (!projectId || typeof projectId !== 'string' || !projectId.trim()) {
      toast({
        title: 'Error',
        description: 'Invalid project ID',
        variant: 'destructive',
      });
      console.error('Invalid project ID:', projectId);
      return;
    }

    setUpdating(true);
    try {
      console.log(
        `Updating project status from ${currentStatus} to ${newStatus} for project ID: ${projectId}`
      );

      // Check if the new status is "completed" (case insensitive)
      const isCompletedStatus = normalizedNewStatus === 'completed';

      // No validation required - we're skipping the transition validation
      // and directly updating the status
      const { error, data } = await supabase
        .from('projects')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('projectid', projectId)
        .select();

      if (error) {
        throw error;
      }

      console.log('Update response data:', data);

      // If status is changed to "completed", update progress to 100%
      if (isCompletedStatus) {
        await updateProgressTo100Percent();
      }

      toast({
        title: 'Status updated',
        description: `Project status changed to ${statusLabels[normalizedNewStatus] || newStatus}.`,
      });

      // Call the onStatusChange callback to refresh project data
      onStatusChange();
    } catch (error: any) {
      console.error('Error updating project status:', error);

      let errorMessage = 'Failed to update project status. Please try again.';

      if (error.message) {
        if (
          error.code === '401' ||
          error.code === 401 ||
          error.message.includes('auth') ||
          error.message.includes('API key')
        ) {
          errorMessage = 'Authentication error. Please refresh the page and try again.';
        } else if (error.details && error.details.includes('violates row-level security')) {
          errorMessage = 'Permission denied: You do not have access to update this project.';
        } else if (error.message.includes('not found')) {
          errorMessage = `Project with ID "${projectId}" not found. It may have been deleted.`;
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
      refreshTransitions();
    } finally {
      setUpdating(false);
    }
  };

  // Helper function to update project progress to 100% when status is completed
  const updateProgressTo100Percent = async () => {
    try {
      // Check if a progress record exists
      const { data: progressData } = await supabase
        .from('project_progress')
        .select('id')
        .eq('projectid', projectId)
        .maybeSingle();

      if (progressData) {
        // Update existing record
        await supabase
          .from('project_progress')
          .update({ progress_percentage: 100 })
          .eq('projectid', projectId);

        console.log('Updated progress to 100% for completed project');
      } else {
        // Create new progress record with 100%
        await supabase.from('project_progress').insert({
          projectid: projectId,
          progress_percentage: 100,
        });

        console.log('Created new progress record with 100% for completed project');
      }
    } catch (error) {
      console.error('Error updating project progress to 100%:', error);
      // We don't want to fail the status update if progress update fails,
      // so we just log the error and continue
    }
  };

  return {
    updating,
    updateStatus,
  };
};
