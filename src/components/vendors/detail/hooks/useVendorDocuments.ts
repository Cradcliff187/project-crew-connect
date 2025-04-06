
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BaseDocument } from '@/components/common/documents/DocumentsSection';
import { toast } from '@/hooks/use-toast';

export interface VendorDocument extends BaseDocument {
  vendor_id?: string;
  vendor_type?: string;
}

export const useVendorDocuments = (vendorId: string) => {
  const [documents, setDocuments] = useState<VendorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchDocuments = useCallback(async () => {
    if (!vendorId) return;
    
    setLoading(true);
    try {
      // Get documents directly related to the vendor
      const { data: vendorDocs, error: vendorError } = await supabase
        .from('documents')
        .select('document_id, file_name, category, created_at, updated_at, file_type, storage_path, entity_id, entity_type')
        .eq('entity_type', 'VENDOR')
        .eq('entity_id', vendorId);
      
      if (vendorError) {
        console.error('Error fetching vendor documents:', vendorError);
        return;
      }
      
      // Also get documents where this entity is referenced as vendor
      const { data: referencedDocs, error: refError } = await supabase
        .from('documents')
        .select('document_id, file_name, category, created_at, updated_at, file_type, storage_path, entity_id, entity_type')
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
            }
          }
          
          // Make sure we return a document with all required fields
          return {
            ...doc,
            url,
            // Ensure all required fields from BaseDocument are present
            entity_id: doc.entity_id || vendorId,
            entity_type: doc.entity_type || 'VENDOR',
            updated_at: doc.updated_at || doc.created_at,
            file_type: doc.file_type || null,
            storage_path: doc.storage_path
          } as VendorDocument;
        })
      );
      
      setDocuments(enhancedDocuments);
    } catch (error) {
      console.error('Error processing vendor documents:', error);
      toast({
        title: "Error",
        description: "Failed to load vendor documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [vendorId]);
  
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  
  return { documents, loading, fetchDocuments };
};
