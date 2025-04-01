import { supabase, DOCUMENTS_BUCKET_ID } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';

export async function fetchDocumentVersions(documentId: string): Promise<Document[]> {
  try {
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('document_id', documentId)
      .single();
      
    if (docError) {
      throw docError;
    }
    
    const parentId = document.parent_document_id || document.document_id;
    
    const { data: versions, error: versionsError } = await supabase
      .from('documents')
      .select('*')
      .or(`document_id.eq.${parentId},parent_document_id.eq.${parentId}`)
      .order('version', { ascending: false });
      
    if (versionsError) {
      throw versionsError;
    }
    
    if (!versions.some(v => v.document_id === document.document_id)) {
      versions.push(document);
    }
    
    const uniqueVersions = versions.filter((v, i, self) => 
      self.findIndex(v2 => v2.document_id === v.document_id) === i
    );
    
    uniqueVersions.sort((a, b) => (b.version || 1) - (a.version || 1));
    
    const versionsWithUrls = uniqueVersions.map(version => {
      const { data } = supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .getPublicUrl(version.storage_path);
        
      return {
        ...version,
        url: data.publicUrl
      };
    });
    
    return versionsWithUrls;
  } catch (error) {
    console.error('Error fetching document versions:', error);
    return [];
  }
}

export async function fetchDocumentsByEntity(entityType: string, entityId: string): Promise<Document[]> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('is_latest_version', true)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    const documentsWithUrls = data.map(doc => {
      const { data } = supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .getPublicUrl(doc.storage_path);
        
      return {
        ...doc,
        url: data.publicUrl
      };
    });
    
    return documentsWithUrls;
  } catch (error) {
    console.error('Error fetching documents by entity:', error);
    return [];
  }
}

interface FetchDocumentOptions {
  imageOptions?: {
    width?: number;
    height?: number;
    quality?: number;
  };
  expiresIn?: number; // URL expiration time in seconds
}

/**
 * Fetches a document by ID and gets a signed URL for viewing
 */
export async function fetchDocumentWithUrl(documentId: string, options: FetchDocumentOptions = {}): Promise<Document | null> {
  try {
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('document_id', documentId)
      .single();
      
    if (docError) {
      console.error('Error fetching document:', docError);
      return null;
    }
    
    if (!document) {
      console.error('Document not found:', documentId);
      return null;
    }
    
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(DOCUMENTS_BUCKET_ID)
      .createSignedUrl(
        document.storage_path,
        options.expiresIn || 300,
        {
          transform: options.imageOptions
        }
      );
      
    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError);
      return null;
    }
    
    return {
      ...document,
      url: signedUrlData.signedUrl
    };
  } catch (error) {
    console.error('Error in fetchDocumentWithUrl:', error);
    return null;
  }
}
