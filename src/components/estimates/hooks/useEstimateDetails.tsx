import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EstimateItem, EstimateRevision } from '@/components/estimates/types/estimateTypes';

const fetchEstimateItems = async (estimateId: string) => {
  // First, find the current revision ID for this estimate
  const { data: currentRevision, error: revisionError } = await supabase
    .from('estimate_revisions')
    .select('id')
    .eq('estimate_id', estimateId)
    .eq('is_current', true)
    .limit(1)
    .single();
  
  if (revisionError) {
    console.error('Error fetching current revision:', revisionError);
    // If we can't find the current revision, fall back to all items
    const { data, error } = await supabase
      .from('estimate_items')
      .select('*')
      .eq('estimate_id', estimateId);
    
    if (error) throw error;
    return data as EstimateItem[];
  }
  
  // Query items specific to the current revision
  const { data, error } = await supabase
    .from('estimate_items')
    .select('*')
    .eq('estimate_id', estimateId)
    .eq('revision_id', currentRevision.id);
  
  if (error) throw error;
  
  // Transform the data to match the EstimateItem format
  return data as EstimateItem[];
};

const fetchEstimateRevisions = async (estimateId: string) => {
  const { data, error } = await supabase
    .from('estimate_revisions')
    .select(`
      id,
      estimate_id,
      version,
      revision_date,
      sent_date,
      notes,
      status,
      is_current,
      amount,
      revision_by,
      document_id
    `)
    .eq('estimate_id', estimateId)
    .order('version', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data || [];
};

export const useEstimateDetails = () => {
  const [currentEstimateId, setCurrentEstimateId] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    data: estimateItems = [],
    isLoading: itemsLoading,
    refetch: refetchItems
  } = useQuery({
    queryKey: ['estimateItems', currentEstimateId],
    queryFn: () => currentEstimateId ? fetchEstimateItems(currentEstimateId) : Promise.resolve([]),
    enabled: !!currentEstimateId,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching estimate items:', error);
        toast({
          title: "Error",
          description: "Failed to load estimate items. Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  const {
    data: estimateRevisions = [],
    isLoading: revisionsLoading,
    refetch: refetchRevisions
  } = useQuery({
    queryKey: ['estimateRevisions', currentEstimateId],
    queryFn: () => currentEstimateId ? fetchEstimateRevisions(currentEstimateId) : Promise.resolve([]),
    enabled: !!currentEstimateId,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching estimate revisions:', error);
        toast({
          title: "Error",
          description: "Failed to load estimate revisions. Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  const fetchEstimateDetails = (estimateId: string) => {
    setCurrentEstimateId(estimateId);
  };

  const setEstimateItems = (items: EstimateItem[]) => {
    // This is a placeholder for state management
    // In a real app with React Query, you would use queryClient.setQueryData
    // For now, we keep this function to maintain interface compatibility
  };

  const setEstimateRevisions = (revisions: EstimateRevision[]) => {
    // This is a placeholder for state management
    // In a real app with React Query, you would use queryClient.setQueryData
    // For now, we keep this function to maintain interface compatibility
  };

  return {
    estimateItems,
    estimateRevisions,
    fetchEstimateDetails,
    setEstimateItems,
    setEstimateRevisions,
    isLoading: itemsLoading || revisionsLoading,
    refetchItems,
    refetchRevisions
  };
};
