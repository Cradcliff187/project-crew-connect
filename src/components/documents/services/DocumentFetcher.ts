import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';

interface FetchDocumentOptions {
  imageOptions?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'png' | 'jpeg';
  };
  expiresIn?: number; // URL expiration time in seconds
}

export async function fetchDocumentWithUrl(
  documentId: string,
  options: FetchDocumentOptions = {}
): Promise<Document | null> {
  try {
    console.log('Fetching document with ID:', documentId);

    // Fetch the document from the database
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('document_id', documentId)
      .single();

    if (error) {
      console.error('Error fetching document:', error);
      throw error;
    }

    if (!document) {
      console.error('Document not found');
      return null;
    }

    // Generate a URL for the document
    if (document.storage_path) {
      let urlOptions: any = {
        download: false,
      };

      // Add transform options for images
      const fileType = document.file_type?.toLowerCase() || '';
      if (fileType.includes('image/') && options.imageOptions) {
        urlOptions.transform = {
          width: options.imageOptions.width || 800,
          height: options.imageOptions.height || 800,
          quality: options.imageOptions.quality || 80,
          format: options.imageOptions.format || 'webp',
        };
      }

      const { data: urlData, error: urlError } = await supabase.storage
        .from('construction_documents')
        .createSignedUrl(document.storage_path, options.expiresIn || 300, urlOptions);

      if (urlError) {
        console.error('Error generating URL:', urlError);
        throw urlError;
      }

      return {
        ...document,
        url: urlData.signedUrl,
      } as Document;
    }

    return document as Document;
  } catch (error) {
    console.error('Error in fetchDocumentWithUrl:', error);
    throw error;
  }
}
