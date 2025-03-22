
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define a standalone interface with all properties explicitly defined
export interface SubcontractorDocument {
  document_id: string;
  file_name: string;
  category: string | null;
  created_at: string;
  file_type: string | null;
  storage_path: string;
  url?: string;
  is_expense?: boolean;
  vendor_id?: string;
  subcontractor_id?: string;
  entity_type?: string;
  entity_id?: string;
  tags?: string[] | null;
  amount?: number | null;
  expense_date?: string | null;
  notes?: string | null;
  version?: number;
  file_size?: number | null;
  uploaded_by?: string | null;
}

export const useSubcontractorDocuments = (subcontractorId: string) => {
  const [documents, setDocuments] = useState<SubcontractorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchDocuments = async () => {
    if (!subcontractorId) return;
    
    setLoading(true);
    try {
      // Get documents directly related to the subcontractor
      const { data: subDocs, error: subError } = await supabase
        .from('documents')
        .select('*')  // Select all fields to ensure we get everything we need
        .eq('entity_type', 'SUBCONTRACTOR')
        .eq('entity_id', subcontractorId);
      
      if (subError) {
        console.error('Error fetching subcontractor documents:', subError);
        return;
      }
      
      // Try to fetch documents that have subcontractor_id field
      const { data: referencedDocs, error: refError } = await supabase
        .from('documents')
        .select('*')  // Select all fields to ensure we get everything we need
        .eq('subcontractor_id', subcontractorId);
      
      if (refError) {
        console.error('Error fetching referenced documents by subcontractor_id:', refError);
        
        // If the above query fails, try the alternative path with vendor_id
        const { data: vendorDocs, error: vendorError } = await supabase
          .from('documents')
          .select('*')  // Select all fields to ensure we get everything we need
          .eq('vendor_id', subcontractorId)
          .eq('entity_type', 'SUBCONTRACTOR');
          
        if (vendorError) {
          console.error('Error fetching documents using vendor_id:', vendorError);
        } else {
          // Use vendor documents if available
          const allDocs = [...(subDocs || []), ...(vendorDocs || [])];
          processDocuments(allDocs);
        }
      } else {
        // Successfully fetched with subcontractor_id
        const allDocs = [...(subDocs || []), ...(referencedDocs || [])];
        processDocuments(allDocs);
      }
    } catch (error) {
      console.error('Error processing subcontractor documents:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to process document data
  const processDocuments = async (docs: any[]) => {
    if (!docs || docs.length === 0) {
      setDocuments([]);
      return;
    }
    
    // Remove duplicates based on document_id
    const uniqueDocs = Array.from(
      new Map(docs.map(doc => [doc.document_id, doc])).values()
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
    
    setDocuments(enhancedDocuments as SubcontractorDocument[]);
  };
  
  useEffect(() => {
    fetchDocuments();
  }, [subcontractorId]);
  
  return { documents, loading, fetchDocuments };
};
