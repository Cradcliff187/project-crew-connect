
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EstimateItem, EstimateRevision } from '../types/estimateTypes';
import { Document } from '@/components/documents/schemas/documentSchema';

export const useEstimateDetails = () => {
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);
  const [estimateRevisions, setEstimateRevisions] = useState<EstimateRevision[]>([]);
  const [itemDocuments, setItemDocuments] = useState<Record<string, Document[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEstimateDetails = async (estimateId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch estimate items
      const { data: items, error: itemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('estimate_id', estimateId)
        .order('created_at', { ascending: true });
      
      if (itemsError) throw itemsError;
      
      setEstimateItems(items || []);
      
      // Fetch estimate revisions
      const { data: revisions, error: revisionsError } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('estimate_id', estimateId)
        .order('version', { ascending: false });
      
      if (revisionsError) throw revisionsError;
      
      setEstimateRevisions(revisions || []);
      
      // Fetch documents for each item that has a document_id
      const itemsWithDocuments = items?.filter(item => item.document_id) || [];
      if (itemsWithDocuments.length > 0) {
        const docIds = itemsWithDocuments.map(item => item.document_id).filter(Boolean);
        
        const { data: documents, error: documentsError } = await supabase
          .from('documents')
          .select('*')
          .in('document_id', docIds);
        
        if (documentsError) throw documentsError;
        
        if (documents) {
          // Get public URLs for each document
          const docsWithUrls = await Promise.all(
            documents.map(async (doc) => {
              if (doc.storage_path) {
                const { data } = supabase.storage
                  .from('construction_documents')
                  .getPublicUrl(doc.storage_path);
                
                return { ...doc, url: data.publicUrl };
              }
              return doc;
            })
          );
          
          // Organize documents by item id
          const docsByItem: Record<string, Document[]> = {};
          
          items?.forEach(item => {
            if (item.document_id) {
              const itemDocs = docsWithUrls.filter(doc => doc.document_id === item.document_id);
              if (itemDocs.length > 0) {
                docsByItem[item.id] = itemDocs;
              }
            }
          });
          
          setItemDocuments(docsByItem);
        }
      }
    } catch (err: any) {
      console.error('Error fetching estimate details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    estimateItems,
    estimateRevisions,
    itemDocuments,
    loading,
    error,
    fetchEstimateDetails,
    setEstimateItems,
    setEstimateRevisions
  };
};
