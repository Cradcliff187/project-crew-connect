
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';

export const useEstimateDocuments = (estimateId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!estimateId) {
        setDocuments([]);
        return;
      }
      
      console.log(`Fetching documents for estimate: ${estimateId}`);
      
      // Fetch documents associated directly with this estimate
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', 'ESTIMATE')
        .eq('entity_id', estimateId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} documents directly associated with estimate ${estimateId}`);
      
      // Transform the data to include document URLs
      const docsWithUrls = await Promise.all((data || []).map(async (doc) => {
        let publicUrl = '';
        
        try {
          // Get the public URL for the document
          const { data: urlData } = supabase.storage
            .from('construction_documents')
            .getPublicUrl(doc.storage_path);
          
          publicUrl = urlData.publicUrl;
        } catch (err) {
          console.error('Error getting public URL:', err);
          // Continue even if we can't get the URL
        }
        
        // Check if this document is attached to an estimate item
        let itemDescription = '';
        if (doc.notes && doc.notes.includes('Item:')) {
          itemDescription = doc.notes.split('Item:')[1].trim();
        }
        
        return { 
          ...doc,
          url: publicUrl,
          item_reference: itemDescription || null,
          item_id: null // Will be populated if this is a line item document
        };
      }));
      
      // Fetch all revisions for this estimate, not just the current one
      const { data: allRevisions, error: revisionsError } = await supabase
        .from('estimate_revisions')
        .select('id')
        .eq('estimate_id', estimateId);
        
      if (revisionsError) {
        console.error('Error fetching estimate revisions:', revisionsError);
      }
      
      let itemDocuments: Document[] = [];
      
      // If we have revisions, fetch documents for items in each revision
      if (allRevisions && allRevisions.length > 0) {
        const revisionIds = allRevisions.map(rev => rev.id);
        
        // Fetch all items that have document associations for all revisions
        const { data: items, error: itemsError } = await supabase
          .from('estimate_items')
          .select('id, description, document_id, revision_id')
          .eq('estimate_id', estimateId)
          .in('revision_id', revisionIds)
          .not('document_id', 'is', null);
          
        if (!itemsError && items && items.length > 0) {
          console.log(`Found ${items.length} items with attached documents across all revisions`);
          
          // Get the unique document IDs
          const documentIds = items.map(item => item.document_id).filter(Boolean);
          
          if (documentIds.length > 0) {
            const { data: itemDocData, error: itemDocsError } = await supabase
              .from('documents')
              .select('*')
              .in('document_id', documentIds);
              
            if (!itemDocsError && itemDocData) {
              // Process these documents and add them to our array
              const itemDocsWithUrls = await Promise.all(itemDocData.map(async (doc) => {
                let publicUrl = '';
                
                try {
                  const { data: urlData } = supabase.storage
                    .from('construction_documents')
                    .getPublicUrl(doc.storage_path);
                  
                  publicUrl = urlData.publicUrl;
                } catch (err) {
                  console.error('Error getting public URL:', err);
                }
                
                // Find the related item for this document
                const relatedItem = items.find(item => item.document_id === doc.document_id);
                
                return { 
                  ...doc,
                  url: publicUrl,
                  item_reference: relatedItem ? `Item: ${relatedItem.description}` : null,
                  item_id: relatedItem ? relatedItem.id : null,
                  revision_id: relatedItem?.revision_id
                };
              }));
              
              itemDocuments = itemDocsWithUrls;
            }
          }
        }
      }
      
      // Additionally fetch vendor-associated documents for estimate items
      const { data: allItems, error: allItemsError } = await supabase
        .from('estimate_items')
        .select('id, description, vendor_id, subcontractor_id')
        .eq('estimate_id', estimateId)
        .or('vendor_id.is.not.null,subcontractor_id.is.not.null');
        
      if (!allItemsError && allItems && allItems.length > 0) {
        console.log(`Found ${allItems.length} items with vendor or subcontractor associations`);
        
        // Process vendors
        const vendorIds = allItems
          .filter(item => item.vendor_id)
          .map(item => item.vendor_id);
          
        if (vendorIds.length > 0) {
          const { data: vendorDocs, error: vendorDocsError } = await supabase
            .from('documents')
            .select('*')
            .eq('entity_type', 'VENDOR')
            .in('entity_id', vendorIds)
            .order('created_at', { ascending: false });
            
          if (!vendorDocsError && vendorDocs && vendorDocs.length > 0) {
            console.log(`Found ${vendorDocs.length} vendor documents`);
            
            // Process and add vendor documents
            const vendorDocsWithUrls = await Promise.all(vendorDocs.map(async (doc) => {
              let publicUrl = '';
              
              try {
                const { data: urlData } = supabase.storage
                  .from('construction_documents')
                  .getPublicUrl(doc.storage_path);
                
                publicUrl = urlData.publicUrl;
              } catch (err) {
                console.error('Error getting public URL:', err);
              }
              
              // Find the related items for this vendor
              const relatedItems = allItems.filter(item => item.vendor_id === doc.entity_id);
              const itemDescriptions = relatedItems.map(item => item.description).join(', ');
              
              return { 
                ...doc,
                url: publicUrl,
                item_reference: `Vendor Document - Related to: ${itemDescriptions}`,
                is_vendor_doc: true,
                item_id: null // These are vendor documents, not directly attached to items
              };
            }));
            
            // Add these documents to our array
            docsWithUrls.push(...vendorDocsWithUrls);
          }
        }
        
        // Process subcontractors
        const subcontractorIds = allItems
          .filter(item => item.subcontractor_id)
          .map(item => item.subcontractor_id);
          
        if (subcontractorIds.length > 0) {
          const { data: subDocs, error: subDocsError } = await supabase
            .from('documents')
            .select('*')
            .eq('entity_type', 'SUBCONTRACTOR')
            .in('entity_id', subcontractorIds)
            .order('created_at', { ascending: false });
            
          if (!subDocsError && subDocs && subDocs.length > 0) {
            console.log(`Found ${subDocs.length} subcontractor documents`);
            
            // Process and add subcontractor documents
            const subDocsWithUrls = await Promise.all(subDocs.map(async (doc) => {
              let publicUrl = '';
              
              try {
                const { data: urlData } = supabase.storage
                  .from('construction_documents')
                  .getPublicUrl(doc.storage_path);
                
                publicUrl = urlData.publicUrl;
              } catch (err) {
                console.error('Error getting public URL:', err);
              }
              
              // Find the related items for this subcontractor
              const relatedItems = allItems.filter(item => item.subcontractor_id === doc.entity_id);
              const itemDescriptions = relatedItems.map(item => item.description).join(', ');
              
              return { 
                ...doc,
                url: publicUrl,
                item_reference: `Subcontractor Document - Related to: ${itemDescriptions}`,
                is_subcontractor_doc: true,
                item_id: null // These are subcontractor documents, not directly attached to items
              };
            }));
            
            // Add these documents to our array
            docsWithUrls.push(...subDocsWithUrls);
          }
        }
      }
      
      // Add item documents to our collection
      docsWithUrls.push(...itemDocuments);
      
      // Remove any duplicate documents (by document_id)
      const uniqueDocs = Array.from(
        new Map(docsWithUrls.map(doc => [doc.document_id, doc])).values()
      );
      
      console.log(`Found a total of ${uniqueDocs.length} unique documents for estimate ${estimateId} across all revisions`);
      
      setDocuments(uniqueDocs);
    } catch (err: any) {
      console.error('Error fetching estimate documents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (estimateId) {
      fetchDocuments();
    }
  }, [estimateId]);

  const refetchDocuments = () => {
    fetchDocuments();
  };

  return {
    documents,
    loading,
    error,
    refetchDocuments
  };
};
