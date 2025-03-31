
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';

interface FetchDocumentOptions {
  imageOptions?: {
    width?: number;
    height?: number;
    quality?: number;
  };
  expiresIn?: number; // Expiration time in seconds
}

/**
 * Fetch a document by ID and generate a public URL for it
 */
export const fetchDocumentWithUrl = async (
  documentId: string,
  options: FetchDocumentOptions = {}
): Promise<Document | null> => {
  try {
    // Fetch the document metadata from the database
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('document_id', documentId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching document:', error);
      return null;
    }
    
    // Generate a public URL for the document
    const { data: { publicUrl } } = supabase.storage
      .from('construction_documents')
      .getPublicUrl(data.storage_path, {
        transform: data.file_type?.startsWith('image/') ? options.imageOptions : undefined,
        download: false,
      });
    
    // Return the document with the URL
    return {
      ...data,
      url: publicUrl
    } as Document;
    
  } catch (error) {
    console.error('Error in fetchDocumentWithUrl:', error);
    return null;
  }
};

/**
 * Fetch multiple documents by entity type and ID
 */
export const fetchDocumentsByEntity = async (
  entityType: string,
  entityId: string,
  options: FetchDocumentOptions = {}
): Promise<Document[]> => {
  try {
    // Fetch document metadata
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
    
    // Add URLs to each document
    const documentsWithUrls = await Promise.all(
      (data || []).map(async (doc) => {
        const { data: { publicUrl } } = supabase.storage
          .from('construction_documents')
          .getPublicUrl(doc.storage_path, {
            transform: doc.file_type?.startsWith('image/') ? options.imageOptions : undefined,
            download: false,
          });
        
        return {
          ...doc,
          url: publicUrl
        } as Document;
      })
    );
    
    return documentsWithUrls;
    
  } catch (error) {
    console.error('Error in fetchDocumentsByEntity:', error);
    return [];
  }
};
