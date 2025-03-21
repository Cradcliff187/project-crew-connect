
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { statusTransitions } from '../../ProjectConstants';

interface StatusOption {
  status: string;
  label: string;
}

interface UseStatusTransitionsProps {
  currentStatus: string;
}

export const useStatusTransitions = ({ currentStatus }: UseStatusTransitionsProps) => {
  const [availableStatuses, setAvailableStatuses] = useState<StatusOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  
  const statusLabels: Record<string, string> = {
    new: 'New',
    active: 'Active',
    on_hold: 'On Hold',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Pending',
  };
  
  const fetchTransitions = useCallback(async () => {
    if (!currentStatus) return;
    
    setLoading(true);
    try {
      const normalizedStatus = currentStatus.toLowerCase();
      console.log(`Fetching transitions for project status: ${normalizedStatus}`);
      
      // First try to get transitions from the database
      const { data, error } = await supabase
        .from('status_transitions')
        .select('to_status, label, description')
        .eq('entity_type', 'PROJECT')
        .eq('from_status', normalizedStatus);

      if (error) {
        // Don't throw error here, just log it and fall back to static transitions
        console.error('Error fetching transitions:', error);
        useStaticTransitions(normalizedStatus);
        return;
      }
      
      if (data && data.length > 0) {
        console.log('Transitions fetched successfully:', data);
        const formattedTransitions = data.map((transition: any) => ({
          status: transition.to_status,
          label: transition.label || statusLabels[transition.to_status] || transition.to_status,
        }));
        setAvailableStatuses(formattedTransitions);
      } else {
        console.warn('No status transitions found in database for status:', normalizedStatus);
        // Fall back to static transitions
        useStaticTransitions(normalizedStatus);
      }
    } catch (error) {
      console.error('Failed to fetch transitions:', error);
      // Fall back to static transitions on error
      useStaticTransitions(currentStatus.toLowerCase());
    } finally {
      setLoading(false);
    }
  }, [currentStatus]);
  
  // Helper function to use static transitions from ProjectConstants
  const useStaticTransitions = (currentStatus: string) => {
    const fallbackTransitions = statusTransitions[currentStatus] || [];
    console.log('Using static fallback transitions:', fallbackTransitions);
    
    const formattedTransitions = fallbackTransitions.map(status => ({
      status,
      label: statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1)
    }));
    
    setAvailableStatuses(formattedTransitions);
  };
  
  // Fetch available status transitions when the currentStatus changes
  useEffect(() => {
    fetchTransitions();
  }, [currentStatus, fetchTransitions]);
  
  return {
    availableStatuses,
    loading,
    refreshTransitions: fetchTransitions
  };
};
