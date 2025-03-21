
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EstimateItem, EstimateRevision } from '../types/estimateTypes';
import { getEstimateDocuments } from '../utils/estimateDocumentUtils';
import { Document } from '@/components/documents/schemas/documentSchema';

export const useEstimateDetails = () => {
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);
  const [estimateRevisions, setEstimateRevisions] = useState<EstimateRevision[]>([]);
  const [estimateDocuments, setEstimateDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEstimateDetails = async (estimateId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch estimate items
      const { data: items, error: itemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('estimate_id', estimateId);
        
      if (itemsError) throw new Error(`Error fetching estimate items: ${itemsError.message}`);
      setEstimateItems(items || []);
      
      // Fetch estimate revisions
      const { data: revisions, error: revisionsError } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('estimate_id', estimateId)
        .order('created_at', { ascending: false });
        
      if (revisionsError) throw new Error(`Error fetching estimate revisions: ${revisionsError.message}`);
      setEstimateRevisions(revisions || []);
      
      // Fetch documents associated with this estimate
      const documents = await getEstimateDocuments(estimateId);
      setEstimateDocuments(documents);
      
    } catch (err: any) {
      console.error('Error fetching estimate details:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetchAll = async (estimateId: string) => {
    await fetchEstimateDetails(estimateId);
  };

  return {
    estimateItems,
    estimateRevisions,
    estimateDocuments,
    isLoading,
    error,
    fetchEstimateDetails,
    setEstimateItems,
    setEstimateRevisions,
    setEstimateDocuments,
    refetchAll
  };
};
