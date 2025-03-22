
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SubcontractorDocument } from '../types/documentTypes';

// Define the SubcontractorDocument type directly in this file to avoid circular references
interface DocumentTypes {
  document_id: string;
  file_name: string;
  category: string | null;
  created_at: string;
  file_type: string | null;
  storage_path?: string;
  url?: string;
  is_expense?: boolean;
}

export const useSubcontractorDocuments = (subcontractorId: string) => {
  const [documents, setDocuments] = useState<DocumentTypes[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchDocuments = async () => {
    if (!subcontractorId) return;
    
    setLoading(true);
    try {
      // Get documents directly related to the subcontractor
      const { data: subDocs, error: subError } = await supabase
        .from('documents')
        .select('document_id, file_name, category, created_at, file_type, storage_path')
        .eq('entity_type', 'SUBCONTRACTOR')
        .eq('entity_id', subcontractorId);
      
      if (subError) {
        console.error('Error fetching subcontractor documents:', subError);
        return;
      }
      
      // Also get documents where this subcontractor is referenced
      const { data: referencedDocs, error: refError } = await supabase
        .from('documents')
        .select('document_id, file_name, category, created_at, file_type, storage_path')
        .eq('subcontractor_id', subcontractorId);
      
      if (refError) {
        console.error('Error fetching referenced documents:', refError);
        return;
      }
      
      // Combine all documents
      const allDocs = [...(subDocs || []), ...(referencedDocs || [])];
      
      // Remove duplicates based on document_id
      const uniqueDocs = Array.from(
        new Map(allDocs.map(doc => [doc.document_id, doc])).values()
      );
      
      // Get public URLs for documents
      const enhancedDocuments = await Promise.all(
        uniqueDocs.map(async (doc) => {
          let url = '';
          if (doc.storage_path) {
            const { data } = supabase.storage
              .from('construction_documents')
              .getPublicUrl(doc.storage_path);
            url = data.publicUrl;
          }
          
          return {
            ...doc,
            url
          };
        })
      );
      
      setDocuments(enhancedDocuments);
    } catch (error) {
      console.error('Error processing subcontractor documents:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDocuments();
  }, [subcontractorId]);
  
  return { documents, loading, fetchDocuments };
};
