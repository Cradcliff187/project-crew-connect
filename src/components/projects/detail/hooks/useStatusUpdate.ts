
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
  refreshTransitions 
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
    const normalizedCurrentStatus = currentStatus.toLowerCase();
    const normalizedNewStatus = newStatus.toLowerCase();
    
    if (normalizedCurrentStatus === normalizedNewStatus) {
      toast({
        title: 'Status unchanged',
        description: `Project is already ${statusLabels[normalizedNewStatus] || newStatus}.`,
      });
      return;
    }
    
    setUpdating(true);
    try {
      console.log(`Updating project status from ${currentStatus} to ${newStatus}`);
      
      const { error } = await supabase
        .from('projects')
        .update({ 
          status: newStatus, // Keep original case for the database
          updated_at: new Date().toISOString()
        })
        .eq('projectid', projectId);
      
      if (error) {
        throw error;
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
        if (error.message.includes('Invalid status transition')) {
          errorMessage = `Status change not allowed: ${error.message}`;
        } else if (error.code === '401' || error.code === 401 || error.message.includes('auth') || error.message.includes('API key')) {
          errorMessage = 'Your session may have expired. Please refresh the page and try again.';
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
  
  return {
    updating,
    updateStatus
  };
};
