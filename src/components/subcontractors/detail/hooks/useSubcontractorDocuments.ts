
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SubcontractorDocument } from '../types';
import { toast } from '@/hooks/use-toast';

export const useSubcontractorDocuments = (subcontractorId: string) => {
  const [documents, setDocuments] = useState<SubcontractorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchDocuments = async () => {
    if (!subcontractorId) return;
    
    setLoading(true);
    try {
      console.log('Fetching documents for subcontractor:', subcontractorId);
      
      // Get documents directly related to the subcontractor
      const { data: subDocs, error: subError } = await supabase
        .from('documents')
        .select('document_id, file_name, category, created_at, updated_at, file_type, storage_path, entity_id, entity_type')
        .eq('entity_type', 'SUBCONTRACTOR')
        .eq('entity_id', subcontractorId);
      
      if (subError) {
        console.error('Error fetching subcontractor documents:', subError);
        return;
      }
      
      // Also get documents where this subcontractor is referenced as vendor
      const { data: referencedDocs, error: refError } = await supabase
        .from('documents')
        .select('document_id, file_name, category, created_at, updated_at, file_type, storage_path, entity_id, entity_type')
        .eq('vendor_id', subcontractorId)
        .eq('vendor_type', 'subcontractor');
      
      if (refError) {
        console.error('Error fetching referenced documents:', refError);
        return;
      }
      
      console.log('Subcontractor documents:', subDocs?.length || 0);
      console.log('Referenced documents:', referencedDocs?.length || 0);
      
      // Combine all documents
      const allDocs = [...(subDocs || []), ...(referencedDocs || [])];
      
      // Remove duplicates based on document_id
      const uniqueDocs = Array.from(
        new Map(allDocs.map(doc => [doc.document_id, doc])).values()
      );
      
      console.log('Total unique documents:', uniqueDocs.length);
      
      // Get public URLs for documents
      const enhancedDocuments = await Promise.all(
        uniqueDocs.map(async (doc) => {
          let url = '';
          if (doc.storage_path) {
            console.log('Getting URL for document:', doc.document_id, 'Path:', doc.storage_path);
            
            // Using createSignedUrl with correct content type option
            const options = {
              download: false,
              transform: {
                width: 800, // Optional: limit size for images
                height: 800,
                quality: 80
              }
            };
            
            // Using signed URLs for better security
            const { data, error } = await supabase.storage
              .from('construction_documents')
              .createSignedUrl(doc.storage_path, 300, options); // 5 minutes expiration
              
            if (error) {
              console.error('Error generating signed URL for', doc.document_id, error);
            } else {
              url = data.signedUrl;
              console.log('Successfully generated signed URL for', doc.document_id);
            }
          } else {
            console.warn('Document has no storage path:', doc.document_id);
          }
          
          // Make sure we return a document with all required fields 
          return {
            ...doc,
            url,
            // Ensure all required fields from BaseDocument are present
            entity_id: doc.entity_id || subcontractorId,
            entity_type: doc.entity_type || 'SUBCONTRACTOR',
            updated_at: doc.updated_at || doc.created_at,
            file_type: doc.file_type || null,
            storage_path: doc.storage_path || ''
          } as SubcontractorDocument;
        })
      );
      
      setDocuments(enhancedDocuments);
    } catch (error) {
      console.error('Error processing subcontractor documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDocuments();
  }, [subcontractorId]);
  
  return { documents, loading, fetchDocuments };
};
