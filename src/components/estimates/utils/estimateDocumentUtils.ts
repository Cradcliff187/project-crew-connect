
import { supabase } from '@/integrations/supabase/client';

/**
 * Uploads a document for an estimate item and returns the document ID
 */
export const uploadItemDocument = async (file: File, estimateId: string, itemIndex: number): Promise<string | null> => {
  try {
    // Create a unique file path
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-item-${itemIndex}.${fileExt}`;
    const filePath = `estimates/${estimateId}/items/${fileName}`;
    
    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('construction_documents')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error('Error uploading document:', uploadError);
      return null;
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('construction_documents')
      .getPublicUrl(filePath);
      
    // Also store document metadata in documents table
    const documentMetadata = {
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: filePath,
      entity_type: 'ESTIMATE',
      entity_id: estimateId,
      category: 'subcontractor_estimate',
      tags: ['estimate_item', `item_${itemIndex}`]
    };
    
    // Insert document metadata and get the document ID
    const { data: insertedDoc, error: documentError } = await supabase
      .from('documents')
      .insert(documentMetadata)
      .select('document_id')
      .single();
      
    if (documentError) {
      console.error('Error storing document metadata:', documentError);
      return null;
    }
    
    return insertedDoc?.document_id || null;
  } catch (error) {
    console.error('Error in document upload:', error);
    return null;
  }
};

/**
 * Updates document entity_id when an estimate is created
 */
export const updateDocumentEntityId = async (documentId: string | undefined, estimateId: string): Promise<boolean> => {
  if (!documentId) return false;
  
  try {
    const { error } = await supabase
      .from('documents')
      .update({ entity_id: estimateId })
      .eq('document_id', documentId);
      
    if (error) {
      console.error('Error updating document entity_id:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in update document entity_id:', error);
    return false;
  }
};
