
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';

interface FetchDocumentOptions {
  imageOptions?: {
    width?: number;
    height?: number;
    quality?: number;
  };
  expiresIn?: number; // URL expiration time in seconds
}

export async function fetchDocumentWithUrl(
  documentId: string, 
  options: FetchDocumentOptions = {}
): Promise<Document | null> {
  try {
    // Fetch document metadata from the database
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('document_id', documentId)
      .single();
      
    if (error) {
      console.error('Error fetching document metadata:', error);
      throw error;
    }
    
    if (!data) {
      console.error('Document not found:', documentId);
      return null;
    }
    
    // Generate a signed URL for the document
    let url = '';
    if (data.storage_path) {
      const signedUrlOptions: any = {
        download: false
      };
      
      // Add transform options for images if provided
      if (options.imageOptions && data.file_type?.startsWith('image/')) {
        signedUrlOptions.transform = {
          width: options.imageOptions.width || 1200,
          height: options.imageOptions.height || 1200,
          quality: options.imageOptions.quality || 90
        };
      }
      
      const { data: urlData, error: urlError } = await supabase.storage
        .from('construction_documents')
        .createSignedUrl(
          data.storage_path, 
          options.expiresIn || 300, // Default to 5 minutes
          signedUrlOptions
        );
        
      if (urlError) {
        console.error('Error generating signed URL:', urlError);
      } else {
        url = urlData.signedUrl;
      }
    }
    
    // Return the document with its URL
    return {
      ...data,
      url
    } as Document;
  } catch (error) {
    console.error('Error in fetchDocumentWithUrl:', error);
    throw error;
  }
}
