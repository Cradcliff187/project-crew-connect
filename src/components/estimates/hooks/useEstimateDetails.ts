
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EstimateItem, EstimateRevision } from '../types/estimateTypes';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/components/documents/schemas/documentSchema';

export const useEstimateDetails = () => {
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);
  const [estimateRevisions, setEstimateRevisions] = useState<EstimateRevision[]>([]);
  const [itemDocuments, setItemDocuments] = useState<Record<string, Document[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchEstimateDetails = async (estimateId: string) => {
    if (!estimateId) return;
    
    setIsLoading(true);
    
    try {
      // Fetch estimate items
      const { data: items, error: itemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('estimate_id', estimateId);
        
      if (itemsError) throw itemsError;
      
      // Format the items for the frontend
      const formattedItems: EstimateItem[] = items?.map(item => ({
        id: item.id,
        estimate_id: item.estimate_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        item_type: item.item_type || 'labor',
        vendor_id: item.vendor_id,
        subcontractor_id: item.subcontractor_id,
        document_id: item.document_id
      })) || [];
      
      setEstimateItems(formattedItems);
      
      // Fetch estimate revisions
      const { data: revisions, error: revisionsError } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('estimate_id', estimateId)
        .order('version', { ascending: false });
        
      if (revisionsError) throw revisionsError;
      
      // Format the revisions for the frontend
      const formattedRevisions: EstimateRevision[] = revisions?.map(rev => ({
        id: rev.id,
        estimate_id: rev.estimate_id,
        version: rev.version,
        revision_date: rev.revision_date,
        revision_by: rev.revision_by || null,
        notes: rev.notes || null,
        amount: rev.amount || null
      })) || [];
      
      setEstimateRevisions(formattedRevisions);
      
      // Fetch documents for each item
      if (formattedItems.length > 0) {
        const itemIds = formattedItems
          .filter(item => item.document_id)
          .map(item => item.document_id);
          
        if (itemIds.length > 0) {
          const { data: documents, error: documentsError } = await supabase
            .from('documents')
            .select('*')
            .in('document_id', itemIds);
            
          if (documentsError) throw documentsError;
          
          // Create a mapping of item ID to document
          const docMapping: Record<string, Document[]> = {};
          
          for (const doc of (documents || [])) {
            // Generate URL for the document
            const { data: { publicUrl } } = supabase.storage
              .from('construction_documents')
              .getPublicUrl(doc.storage_path);
              
            const docWithUrl = { ...doc, url: publicUrl };
            
            // Find all items that reference this document
            formattedItems.forEach(item => {
              if (item.document_id === doc.document_id) {
                if (!docMapping[item.id]) {
                  docMapping[item.id] = [];
                }
                docMapping[item.id].push(docWithUrl as Document);
              }
            });
          }
          
          setItemDocuments(docMapping);
        }
      }
      
    } catch (error) {
      console.error('Error fetching estimate details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load estimate details. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    estimateItems,
    estimateRevisions,
    itemDocuments,
    isLoading,
    fetchEstimateDetails,
    setEstimateItems,
    setEstimateRevisions
  };
};
