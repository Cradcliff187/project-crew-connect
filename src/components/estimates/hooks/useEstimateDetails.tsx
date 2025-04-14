import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EstimateRevision } from '../types/estimateTypes';
import { useToast } from '@/hooks/use-toast';

export const useEstimateDetails = () => {
  const [estimateRevisions, setEstimateRevisions] = useState<EstimateRevision[]>([]);
  const [currentRevision, setCurrentRevision] = useState<EstimateRevision | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEstimateDetails = useCallback(
    async (estimateId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch all revisions for this estimate
        const { data: revisionsData, error: revisionsError } = await supabase
          .from('estimate_revisions')
          .select('*')
          .eq('estimate_id', estimateId)
          .order('version', { ascending: false });

        if (revisionsError) throw revisionsError;

        setEstimateRevisions(revisionsData || []);

        // Find the current revision
        const current = revisionsData?.find(rev => rev.is_current) || revisionsData?.[0] || null;
        setCurrentRevision(current);

        return {
          revisions: revisionsData || [],
          current,
        };
      } catch (err: any) {
        console.error('Error fetching estimate details:', err);
        setError(err.message || 'Failed to load estimate details');
        toast({
          title: 'Error',
          description: 'Failed to load estimate revisions',
          variant: 'destructive',
        });
        return { revisions: [], current: null };
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const refetchRevisions = useCallback(
    (estimateId?: string) => {
      if (estimateId) {
        return fetchEstimateDetails(estimateId);
      }
      return null;
    },
    [fetchEstimateDetails]
  );

  const setRevisionAsCurrent = useCallback(
    async (revisionId: string, estimateId: string) => {
      try {
        // First, set all revisions to not current
        await supabase
          .from('estimate_revisions')
          .update({ is_current: false })
          .eq('estimate_id', estimateId);

        // Then set the selected revision as current
        const { error } = await supabase
          .from('estimate_revisions')
          .update({ is_current: true })
          .eq('id', revisionId);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Current revision updated',
        });

        // Refetch revisions to update the state
        refetchRevisions(estimateId);
        return true;
      } catch (err: any) {
        console.error('Error setting current revision:', err);
        toast({
          title: 'Error',
          description: 'Failed to update current revision',
          variant: 'destructive',
        });
        return false;
      }
    },
    [toast, refetchRevisions]
  );

  return {
    estimateRevisions,
    currentRevision,
    isLoading,
    error,
    fetchEstimateDetails,
    refetchRevisions,
    setRevisionAsCurrent,
  };
};
