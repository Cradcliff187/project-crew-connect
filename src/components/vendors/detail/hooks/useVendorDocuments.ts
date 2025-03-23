
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VendorDocument } from '../types';
import { toast } from '@/hooks/use-toast';

export const useVendorDocuments = (vendorId: string) => {
  const [documents, setDocuments] = useState<VendorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchDocuments = async () => {
    if (!vendorId) return;
    
    setLoading(true);
    try {
      console.log('Fetching documents for vendor:', vendorId);
      
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
      
      console.log('Vendor documents:', vendorDocs?.length || 0);
      console.log('Referenced documents:', referencedDocs?.length || 0);
      
      // Combine all documents
      const allDocs = [...(vendorDocs || []), ...(referencedDocs || [])];
      
      // Remove duplicates based on document_id
      const uniqueDocs = Array.from(
        new Map(allDocs.map(doc => [doc.document_id, doc])).values()
      );
      
      console.log('Total unique documents:', uniqueDocs.length);
      
      // Get signed URLs for documents for better security
      const enhancedDocuments = await Promise.all(
        uniqueDocs.map(async (doc) => {
          let url = '';
          if (doc.storage_path) {
            console.log('Getting signed URL for document:', doc.document_id, 'Path:', doc.storage_path);
            
            // Using createSignedUrl with correct content type option
            const options = {
              download: false,
              transform: {
                width: 800, // Optional: limit size for images
                height: 800,
                quality: 80
              }
            };

            // Using the correct bucket name - construction_documents
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
