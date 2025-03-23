
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VendorDocument } from '../types';

export const useVendorDocuments = (vendorId: string) => {
  const [documents, setDocuments] = useState<VendorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchDocuments = async () => {
    if (!vendorId) return;
    
    setLoading(true);
    try {
      // Get documents directly related to the vendor
      const { data: vendorDocs, error: vendorError } = await supabase
        .from('documents')
        .select('document_id, file_name, category, created_at, file_type, storage_path')
        .eq('entity_type', 'VENDOR')
        .eq('entity_id', vendorId);
      
      if (vendorError) {
        console.error('Error fetching vendor documents:', vendorError);
        return;
      }
      
      // Also get documents where this entity is referenced as vendor
      const { data: referencedDocs, error: refError } = await supabase
        .from('documents')
        .select('document_id, file_name, category, created_at, file_type, storage_path')
        .eq('vendor_id', vendorId)
        .eq('vendor_type', 'vendor');
      
      if (refError) {
        console.error('Error fetching referenced documents:', refError);
        return;
      }
      
      // Combine all documents
      const allDocs = [...(vendorDocs || []), ...(referencedDocs || [])];
      
      // Remove duplicates based on document_id
      const uniqueDocs = Array.from(
        new Map(allDocs.map(doc => [doc.document_id, doc])).values()
      );
      
      // Get signed URLs for documents for better security
      const enhancedDocuments = await Promise.all(
        uniqueDocs.map(async (doc) => {
          let url = '';
          if (doc.storage_path) {
            // Using createSignedUrl instead of getPublicUrl for better security
            const { data, error } = await supabase.storage
              .from('construction_documents') // Using the correct bucket name
              .createSignedUrl(doc.storage_path, 300); // 5 minutes expiration
              
            if (error) {
              console.error('Error generating signed URL for', doc.document_id, error);
            } else {
              url = data.signedUrl;
            }
          }
          
          return {
            ...doc,
            url
          };
        })
      );
      
      setDocuments(enhancedDocuments);
    } catch (error) {
      console.error('Error processing vendor documents:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDocuments();
  }, [vendorId]);
  
  return { documents, loading, fetchDocuments };
};
