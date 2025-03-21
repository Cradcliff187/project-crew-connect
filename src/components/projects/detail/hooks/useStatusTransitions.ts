
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { statusTransitions as fallbackTransitions } from '@/components/projects/ProjectConstants';

export const useStatusTransitions = (projectId: string, currentStatus: string) => {
  const [allowedTransitions, setAllowedTransitions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransitions = async () => {
    if (!projectId || !currentStatus) {
      setAllowedTransitions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching transitions for project: ${projectId}, status: ${currentStatus}`);
      
      // Normalize status to lowercase for consistency
      const normalizedStatus = currentStatus.toLowerCase();
      
      // Call RPC function to get next possible transitions
      const { data, error } = await supabase
        .rpc('get_next_possible_transitions', {
          entity_type_param: 'PROJECT',
          current_status_param: normalizedStatus
        });
      
      if (error) {
        console.error('Error fetching transitions:', error);
        // Fall back to client-side transitions if the RPC call fails
        const fallbackOptions = fallbackTransitions[normalizedStatus] || [];
        setAllowedTransitions(fallbackOptions);
        setError(`Falling back to predefined transitions. Server error: ${error.message}`);
      } else if (data && data.length > 0) {
        // Extract to_status from each transition entry
        const transitions = data.map((item: any) => item.to_status);
        setAllowedTransitions(transitions);
        console.log('Fetched transitions:', transitions);
      } else {
        // If no transitions found, fall back to client-side definitions
        const fallbackOptions = fallbackTransitions[normalizedStatus] || [];
        setAllowedTransitions(fallbackOptions);
        console.log('No transitions found in DB, using fallback:', fallbackOptions);
      }
    } catch (err: any) {
      console.error('Error in transition fetching:', err);
      // Use fallback transitions in case of error
      const normalizedStatus = currentStatus.toLowerCase();
      const fallbackOptions = fallbackTransitions[normalizedStatus] || [];
      setAllowedTransitions(fallbackOptions);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransitions();
  }, [projectId, currentStatus]);

  return {
    allowedTransitions,
    loading,
    error,
    refreshTransitions: fetchTransitions
  };
};
