
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
      
      // Now fetch documents for this estimate
      await fetchItemDocuments(estimateId);
    } catch (err: any) {
      console.error('Error fetching estimate details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemDocuments = async (estimateId: string) => {
    try {
      // Fetch all documents for this estimate
      const { data: documents, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', 'ESTIMATE')
        .eq('entity_id', estimateId);
        
      if (docsError) throw docsError;
      
      if (documents && documents.length > 0) {
        // Get the URLs for the documents
        const docsWithUrls = await Promise.all(
          documents.map(async (doc) => {
            if (doc.storage_path) {
              const { data: urlData } = supabase.storage
                .from('construction_documents')
                .getPublicUrl(doc.storage_path);
              
              return { ...doc, url: urlData.publicUrl };
            }
            return doc;
          })
        );
        
        // Group documents by estimate item ID using the tags field
        // or by vendor/subcontractor ID
        const itemDocs: Record<string, Document[]> = {};
        
        // Fetch all items to associate by vendor/subcontractor
        const { data: items } = await supabase
          .from('estimate_items')
          .select('id, vendor_id, subcontractor_id')
          .eq('estimate_id', estimateId);
        
        if (items) {
          // Create a map of vendor/subcontractor IDs to item IDs
          const vendorItemMap: Record<string, string[]> = {};
          items.forEach(item => {
            if (item.vendor_id) {
              vendorItemMap[item.vendor_id] = [
                ...(vendorItemMap[item.vendor_id] || []),
                item.id
              ];
            }
            if (item.subcontractor_id) {
              vendorItemMap[item.subcontractor_id] = [
                ...(vendorItemMap[item.subcontractor_id] || []),
                item.id
              ];
            }
          });
          
          // For each document, find related items
          docsWithUrls.forEach(doc => {
            // If document has tags that match an item description, associate with that item
            if (doc.tags && Array.isArray(doc.tags)) {
              items.forEach(item => {
                if (doc.tags.some(tag => 
                  tag.toLowerCase().includes(item.id.toLowerCase())
                )) {
                  itemDocs[item.id] = [...(itemDocs[item.id] || []), doc];
                }
              });
            }
            
            // If document has vendor_id or is associated with a vendor
            if (doc.vendor_id && vendorItemMap[doc.vendor_id]) {
              vendorItemMap[doc.vendor_id].forEach(itemId => {
                itemDocs[itemId] = [...(itemDocs[itemId] || []), doc];
              });
            }
          });
        }
        
        setItemDocuments(itemDocs);
      } else {
        setItemDocuments({});
      }
    } catch (err: any) {
      console.error('Error fetching item documents:', err);
    }
  };

  return {
    estimateItems,
    estimateRevisions,
    itemDocuments,
    loading,
    error,
    fetchEstimateDetails,
    fetchItemDocuments,  // Make sure this is exported
    setEstimateItems,
    setEstimateRevisions
  };
};
