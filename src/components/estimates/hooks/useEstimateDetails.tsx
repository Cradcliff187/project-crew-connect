
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EstimateItem, EstimateRevision } from '@/components/estimates/types/estimateTypes';
import { Document } from '@/components/documents/schemas/documentSchema';

const fetchEstimateItems = async (estimateId: string) => {
  const { data, error } = await supabase
    .from('estimate_items')
    .select('*')
    .eq('estimate_id', estimateId);
  
  if (error) {
    throw error;
  }
  
  return data || [];
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

const fetchEstimateDocuments = async (estimateId: string) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('entity_type', 'ESTIMATE')
    .eq('entity_id', estimateId);

  if (error) {
    throw error;
  }

  // Get document URLs
  const docsWithUrls = await Promise.all((data || []).map(async (doc) => {
    const { data: { publicUrl } } = supabase.storage
      .from('construction_documents')
      .getPublicUrl(doc.storage_path);
    
    return { ...doc, url: publicUrl };
  }));

  return docsWithUrls || [];
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

  const {
    data: estimateDocuments = [],
    isLoading: documentsLoading,
    refetch: refetchDocuments
  } = useQuery({
    queryKey: ['estimateDocuments', currentEstimateId],
    queryFn: () => currentEstimateId ? fetchEstimateDocuments(currentEstimateId) : Promise.resolve([]),
    enabled: !!currentEstimateId,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching estimate documents:', error);
        toast({
          title: "Error",
          description: "Failed to load estimate documents. Please try again.",
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
    estimateDocuments,
    fetchEstimateDetails,
    setEstimateItems,
    setEstimateRevisions,
    isLoading: itemsLoading || revisionsLoading || documentsLoading,
    refetchAll: () => {
      refetchItems();
      refetchRevisions();
      refetchDocuments();
    }
  };
};
