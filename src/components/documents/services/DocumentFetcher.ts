
import { supabase, DOCUMENTS_BUCKET_ID } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
}

interface FetchDocumentOptions {
  imageOptions?: ImageOptions;
  expiresIn?: number; // in seconds
}

/**
 * Fetches a document by ID and generates a signed URL
 */
export async function fetchDocumentWithUrl(
  documentId: string,
  options: FetchDocumentOptions = {}
): Promise<Document | null> {
  try {
    console.log('Fetching document with ID:', documentId);
    
    // First fetch the document metadata
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('document_id', documentId)
      .single();
      
    if (error) {
      console.error('Error fetching document:', error);
      return null;
    }
    
    if (!document || !document.storage_path) {
      console.error('Document not found or has no storage path');
      return null;
    }
    
    // Generate the URL with provided options
    let url: string;
    
    if (options.imageOptions && document.file_type?.startsWith('image/')) {
      // For images, we can use transformation options
      const { data: urlData, error: urlError } = await supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .createSignedUrl(
          document.storage_path, 
          options.expiresIn || 300, // default 5 minutes
          {
            transform: {
              width: options.imageOptions.width,
              height: options.imageOptions.height,
              quality: options.imageOptions.quality
            }
          }
        );
        
      if (urlError) {
        console.error('Error generating signed URL:', urlError);
        return null;
      }
      
      url = urlData.signedUrl;
    } else {
      // For non-images, just get a regular signed URL
      const { data: urlData, error: urlError } = await supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .createSignedUrl(
          document.storage_path, 
          options.expiresIn || 300
        );
        
      if (urlError) {
        console.error('Error generating signed URL:', urlError);
        return null;
      }
      
      url = urlData.signedUrl;
    }
    
    return {
      ...document,
      url
    } as Document;
  } catch (error) {
    console.error('Error in fetchDocumentWithUrl:', error);
    return null;
  }
}

/**
 * Fetches multiple documents by IDs
 */
export async function fetchDocumentsWithUrls(
  documentIds: string[],
  options: FetchDocumentOptions = {}
): Promise<Document[]> {
  if (!documentIds.length) return [];
  
  try {
    // Fetch all documents metadata
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .in('document_id', documentIds);
      
    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
    
    // Generate signed URLs for each document
    const docsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        if (!doc.storage_path) {
          return { ...doc, url: '' };
        }
        
        let url = '';
        
        try {
          const { data: urlData } = await supabase.storage
            .from(DOCUMENTS_BUCKET_ID)
            .createSignedUrl(
              doc.storage_path, 
              options.expiresIn || 300
            );
            
          url = urlData?.signedUrl || '';
        } catch (e) {
          console.error(`Error generating URL for document ${doc.document_id}:`, e);
        }
        
        return { ...doc, url } as Document;
      })
    );
    
    return docsWithUrls;
  } catch (error) {
    console.error('Error in fetchDocumentsWithUrls:', error);
    return [];
  }
}
