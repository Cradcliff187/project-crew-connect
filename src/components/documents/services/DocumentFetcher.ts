
import { supabase, DOCUMENTS_BUCKET_ID } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';

export async function fetchDocumentVersions(documentId: string): Promise<Document[]> {
  try {
    // First get the document itself
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('document_id', documentId)
      .single();
      
    if (docError) {
      throw docError;
    }
    
    // If this is already a version of another document, get that parent ID
    const parentId = document.parent_document_id || document.document_id;
    
    // Fetch all versions related to this document (either as parent or child)
    const { data: versions, error: versionsError } = await supabase
      .from('documents')
      .select('*')
      .or(`document_id.eq.${parentId},parent_document_id.eq.${parentId}`)
      .order('version', { ascending: false });
      
    if (versionsError) {
      throw versionsError;
    }
    
    // If the original document isn't already included, add it
    if (!versions.some(v => v.document_id === document.document_id)) {
      versions.push(document);
    }
    
    // Add the document itself if it's not already in the versions list
    const uniqueVersions = versions.filter((v, i, self) => 
      self.findIndex(v2 => v2.document_id === v.document_id) === i
    );
    
    // Sort versions by version number, with latest first
    uniqueVersions.sort((a, b) => (b.version || 1) - (a.version || 1));
    
    // Get public URLs for all versions
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
    
    // Add public URLs to documents
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
