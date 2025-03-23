
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';
import { toast } from '@/hooks/use-toast';

export interface FetchDocumentOptions {
  imageOptions?: {
    width?: number;
    height?: number;
    quality?: number;
  };
  download?: boolean;
  expiresIn?: number;
}

export async function fetchDocumentWithUrl(documentId: string, options: FetchDocumentOptions = {}): Promise<Document | null> {
  try {
    console.log('Fetching document:', documentId);
    
    // First get the document data from the database
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('document_id', documentId)
      .single();
    
    if (error) {
      console.error('Error fetching document record:', error);
      throw error;
    }
    
    console.log('Retrieved document data:', data);
    
    if (!data.storage_path) {
      console.error('Document has no storage_path:', data);
      throw new Error('Document has no storage path');
    }
    
    // Generate signed URL for the document with the correct bucket name and options
    const supabaseOptions = {
      download: options.download ?? false,
      transform: options.imageOptions ? {
        width: options.imageOptions.width || 1200,
        height: options.imageOptions.height || 1200,
        quality: options.imageOptions.quality || 90
      } : undefined
    };
    
    // 5 minutes default expiration 
    const expiresIn = options.expiresIn || 300;
    
    const { data: urlData, error: urlError } = await supabase
      .storage
      .from('construction_documents')
      .createSignedUrl(data.storage_path, expiresIn, supabaseOptions);
    
    if (urlError) {
      console.error('Error creating signed URL:', urlError);
      throw urlError;
    }
    
    console.log('Generated signed URL:', urlData);
    
    // Return the document with URL and additional properties
    return { 
      ...data, 
      url: urlData.signedUrl,
      file_type: data.file_type || 'application/octet-stream', // Ensure we have a file type
      file_name: data.file_name || 'document.pdf' // Ensure we have a file name
    } as Document;
  } catch (error: any) {
    console.error('Error fetching document:', error);
    toast({
      title: 'Error',
      description: 'Failed to load document: ' + error.message,
      variant: 'destructive',
    });
    return null;
  }
}

export async function fetchDocumentsByEntityId(entityType: string, entityId: string): Promise<Document[]> {
  try {
    console.log(`Fetching documents for ${entityType}: ${entityId}`);
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);
      
    if (error) {
      console.error('Error fetching entity documents:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} documents`);
    
    // Return documents without URLs to avoid excessive storage calls
    // URLs can be fetched on demand when viewing specific documents
    return data as Document[];
  } catch (error: any) {
    console.error('Error fetching entity documents:', error);
    toast({
      title: 'Error',
      description: 'Failed to load documents: ' + error.message,
      variant: 'destructive',
    });
    return [];
  }
}
