
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';

interface FetchOptions {
  imageOptions?: {
    width?: number;
    height?: number;
    quality?: number;
  };
  expiresIn?: number;
}

/**
 * Fetches a document by ID and includes a public URL
 */
export const fetchDocumentWithUrl = async (
  documentId: string, 
  options: FetchOptions = {}
): Promise<Document | null> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('document_id', documentId)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    // Get URL based on file type and options
    let url: string;
    const isImage = data.file_type?.toLowerCase().startsWith('image/');
    
    if (isImage && options.imageOptions) {
      const { width, height, quality } = options.imageOptions;
      const transformOptions = {
        width,
        height,
        quality: quality || 80,
        format: 'auto',
      };
      
      const { data: transformData } = supabase.storage
        .from('construction_documents')
        .getPublicUrl(data.storage_path, {
          transform: transformOptions,
        });
      
      url = transformData.publicUrl;
    } else if (options.expiresIn) {
      // Get signed URL with expiration
      const { data: signedData, error: signedError } = await supabase.storage
        .from('construction_documents')
        .createSignedUrl(data.storage_path, options.expiresIn);
      
      if (signedError) {
        throw signedError;
      }
      
      url = signedData.signedUrl;
    } else {
      // Get standard public URL
      const { data: publicData } = supabase.storage
        .from('construction_documents')
        .getPublicUrl(data.storage_path);
      
      url = publicData.publicUrl;
    }
    
    return { ...data, url };
  } catch (error) {
    console.error('Error fetching document with URL:', error);
    return null;
  }
};

/**
 * Fetches multiple documents by entity
 */
export const fetchDocumentsByEntity = async (
  entityType: string,
  entityId: string
): Promise<Document[]> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Add URLs to all documents
    const docsWithUrls = await Promise.all(data.map(async (doc) => {
      const { data: { publicUrl } } = supabase.storage
        .from('construction_documents')
        .getPublicUrl(doc.storage_path);
      
      return { ...doc, url: publicUrl };
    }));
    
    return docsWithUrls;
  } catch (error) {
    console.error('Error fetching entity documents:', error);
    return [];
  }
};
