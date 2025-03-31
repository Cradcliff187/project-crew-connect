
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EstimateItem, EstimateRevision } from '@/components/estimates/types/estimateTypes';

const fetchEstimateItems = async (estimateId: string) => {
  try {
    // First, find the current revision ID for this estimate
    const { data: currentRevision, error: revisionError } = await supabase
      .from('estimate_revisions')
      .select('id')
      .eq('estimate_id', estimateId)
      .eq('is_current', true)
      .limit(1)
      .maybeSingle(); // Using maybeSingle instead of single to handle no results case
    
    if (revisionError) {
      console.error('Error fetching current revision:', revisionError);
      throw revisionError;
    }
    
    // If we have a current revision, try to get items for it first
    if (currentRevision) {
      console.log(`Found current revision ${currentRevision.id} for estimate ${estimateId}, fetching items for this revision`);
      
      const { data: currentItems, error: currentItemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('estimate_id', estimateId)
        .eq('revision_id', currentRevision.id);
      
      if (currentItemsError) {
        console.error('Error fetching current revision items:', currentItemsError);
        throw currentItemsError;
      }
      
      // If we have items in the current revision, return them
      if (currentItems && currentItems.length > 0) {
        console.log(`Found ${currentItems.length} items for current revision`);
        return currentItems as EstimateItem[];
      }
      
      // If no items in current revision, we'll try the latest revision with items below
      console.log('Current revision has no items, will try to find items in previous revisions');
    }
    
    // Find the latest revision that has items (may not be the current one)
    const { data: revisions } = await supabase
      .from('estimate_revisions')
      .select('id')
      .eq('estimate_id', estimateId)
      .order('version', { ascending: false });
    
    if (revisions && revisions.length > 0) {
      // Check each revision for items, starting with the most recent
      for (const revision of revisions) {
        const { data: items, error } = await supabase
          .from('estimate_items')
          .select('*')
          .eq('estimate_id', estimateId)
          .eq('revision_id', revision.id);
        
        if (error) {
          console.error(`Error fetching items for revision ${revision.id}:`, error);
          continue; // Try the next revision
        }
        
        if (items && items.length > 0) {
          console.log(`Found ${items.length} items in revision ${revision.id}`);
          return items as EstimateItem[];
        }
      }
    }
    
    // If no items found in any revision, return empty array
    console.log(`No items found in any revision for estimate ${estimateId}`);
    return [];
  } catch (error) {
    console.error('Error in fetchEstimateItems:', error);
    return [];
  }
};

const fetchEstimateRevisions = async (estimateId: string) => {
  try {
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
    
    console.log(`Found ${data?.length || 0} revisions for estimate ${estimateId}`);
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchEstimateRevisions:', error);
    return [];
  }
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
    console.log('Fetching details for estimate:', estimateId);
    setCurrentEstimateId(estimateId);
  };

  const setEstimateItems = (items: EstimateItem[]) => {
    // This is a placeholder for state management
    // In a real app with React Query, you would use queryClient.setQueryData
    console.log('Setting estimate items:', items);
  };

  const setEstimateRevisions = (revisions: EstimateRevision[]) => {
    // This is a placeholder for state management
    // In a real app with React Query, you would use queryClient.setQueryData
    console.log('Setting estimate revisions:', revisions);
  };

  return {
    estimateItems,
    estimateRevisions,
    fetchEstimateDetails,
    setEstimateItems,
    setEstimateRevisions,
    isLoading: itemsLoading || revisionsLoading,
    refetchItems,
    refetchRevisions,
    currentEstimateId
  };
};
