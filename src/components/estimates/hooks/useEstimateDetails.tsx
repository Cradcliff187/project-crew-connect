
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EstimateItem, EstimateRevision } from '@/components/estimates/EstimateDetails';

export const useEstimateDetails = () => {
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);
  const [estimateRevisions, setEstimateRevisions] = useState<EstimateRevision[]>([]);
  const { toast } = useToast();

  const fetchEstimateDetails = async (estimateId: string) => {
    try {
      const { data: items, error: itemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('estimate_id', estimateId);
      
      if (itemsError) {
        throw itemsError;
      }
      
      const { data: revisions, error: revisionsError } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('estimate_id', estimateId)
        .order('version', { ascending: false });
      
      if (revisionsError) {
        throw revisionsError;
      }
      
      setEstimateItems(items || []);
      setEstimateRevisions(revisions || []);
    } catch (error) {
      console.error('Error fetching estimate details:', error);
      toast({
        title: "Error",
        description: "Failed to load estimate details. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    estimateItems,
    estimateRevisions,
    fetchEstimateDetails,
    setEstimateItems,
    setEstimateRevisions
  };
};
