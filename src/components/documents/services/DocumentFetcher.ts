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
    
    // Determine MIME type for proper handling
    const mimeType = data.mime_type || determineMimeType(data.file_name, data.file_type);
    
    // Generate signed URL for the document with the correct bucket name and options
    const supabaseOptions = {
      download: options.download ?? false,
      transform: options.imageOptions && isImageType(mimeType) ? {
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
      file_type: mimeType || 'application/octet-stream', // Ensure we have a proper MIME type
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

// Helper to determine MIME type from file extension if not provided
function determineMimeType(fileName: string = '', existingType: string = ''): string {
  // If we already have a valid MIME type, use it
  if (existingType && existingType.includes('/')) {
    return existingType;
  }
  
  // Otherwise, try to determine from file extension
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  // Common MIME type mappings
  const mimeMap: Record<string, string> = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'txt': 'text/plain'
  };
  
  return mimeMap[extension] || 'application/octet-stream';
}

// Helper to check if a MIME type is an image
function isImageType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
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
    
    // Process documents to ensure they have proper MIME types
    const processedDocuments = data?.map(doc => ({
      ...doc,
      file_type: doc.mime_type || determineMimeType(doc.file_name, doc.file_type)
    })) || [];
    
    return processedDocuments as Document[];
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
