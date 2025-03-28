
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EstimateItem, EstimateRevision } from '@/components/estimates/types/estimateTypes';

const fetchEstimateItems = async (estimateId: string) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('entity_type', 'ESTIMATE')
    .eq('entity_id', estimateId);
  
  if (error) {
    throw error;
  }
  
  // Transform to EstimateItem format
  const items = data.map(expense => ({
    id: expense.id,
    estimate_id: expense.entity_id,
    description: expense.description,
    quantity: expense.quantity || 1,
    unit_price: expense.unit_price || 0,
    total_price: expense.amount || 0,
    cost: expense.unit_price || 0,
    markup_percentage: 0,
    item_type: expense.expense_type
  })) as EstimateItem[];
  
  return items;
};

const fetchEstimateRevisions = async (estimateId: string) => {
  const { data, error } = await supabase
    .from('estimate_revisions')
    .select('*')
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
    isLoading: itemsLoading || revisionsLoading
  };
};
