
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EstimateItem, EstimateRevision } from '@/components/estimates/types/estimateTypes';
import { Document } from '@/components/documents/schemas/documentSchema';

const fetchEstimateItems = async (estimateId: string) => {
  console.log(`Fetching items for estimate: ${estimateId}`);
  const { data, error } = await supabase
    .from('estimate_items')
    .select('*')
    .eq('estimate_id', estimateId);
  
  if (error) {
    console.error("Error fetching estimate items:", error);
    throw error;
  }
  
  console.log(`Retrieved ${data?.length || 0} items for estimate ${estimateId}`);
  return data || [];
};

const fetchEstimateRevisions = async (estimateId: string) => {
  console.log(`Fetching revisions for estimate: ${estimateId}`);
  const { data, error } = await supabase
    .from('estimate_revisions')
    .select('*')
    .eq('estimate_id', estimateId)
    .order('version', { ascending: false });
  
  if (error) {
    console.error("Error fetching estimate revisions:", error);
    throw error;
  }
  
  console.log(`Retrieved ${data?.length || 0} revisions for estimate ${estimateId}`);
  return data || [];
};

const fetchEstimateDocuments = async (estimateId: string) => {
  console.log(`Fetching documents for estimate: ${estimateId}`);
  
  // First, get documents directly linked to the estimate
  const { data: directDocs, error: directError } = await supabase
    .from('documents')
    .select('*')
    .eq('entity_type', 'ESTIMATE')
    .eq('entity_id', estimateId);

  if (directError) {
    console.error("Error fetching direct estimate documents:", directError);
    throw directError;
  }
  
  console.log(`Retrieved ${directDocs?.length || 0} direct documents for estimate ${estimateId}`);
  
  // Then, get documents linked through estimate_items
  const { data: itemDocs, error: itemsError } = await supabase
    .from('estimate_items')
    .select('document_id')
    .eq('estimate_id', estimateId)
    .not('document_id', 'is', null);
    
  if (itemsError) {
    console.error("Error fetching estimate items with documents:", itemsError);
    throw itemsError;
  }
  
  console.log(`Found ${itemDocs?.length || 0} item document references`);
  
  // Get the actual document records for those linked through items
  let linkedDocs: any[] = [];
  if (itemDocs && itemDocs.length > 0) {
    const documentIds = itemDocs.map(item => item.document_id).filter(Boolean);
    
    if (documentIds.length > 0) {
      const { data: docs, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .in('document_id', documentIds);
        
      if (docsError) {
        console.error("Error fetching linked documents:", docsError);
      } else {
        linkedDocs = docs || [];
        console.log(`Retrieved ${linkedDocs.length} linked documents`);
      }
    }
  }
  
  // Combine both sets of documents
  const allDocs = [...(directDocs || []), ...linkedDocs];
  
  // Remove duplicates (if any)
  const uniqueDocs = allDocs.filter((doc, index, self) => 
    index === self.findIndex(d => d.document_id === doc.document_id)
  );
  
  console.log(`Total unique documents: ${uniqueDocs.length}`);

  // Get document URLs
  const docsWithUrls = await Promise.all(uniqueDocs.map(async (doc) => {
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
    console.log(`Setting current estimate ID to ${estimateId}`);
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
