
import { supabase, DOCUMENTS_BUCKET_ID } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Document, EntityType, DocumentCategory } from '../schemas/documentSchema';

interface DocumentMetadata {
  category?: DocumentCategory;
  description?: string;
  isExpense?: boolean;
  vendorId?: string;
  vendorType?: string;
  amount?: number;
  expenseDate?: Date;
  expenseType?: string;
  notes?: string;
  tags?: string[];
  version?: number;
}

export const DocumentService = {
  /**
   * Uploads a document to the specified entity and returns the created document record
   */
  uploadDocument: async (
    file: File,
    entityType: EntityType,
    entityId: string,
    metadata: DocumentMetadata = {}
  ): Promise<Document | null> => {
    try {
      console.log('Starting document upload', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        entityType,
        entityId,
        metadata
      });
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileKey = `${entityType.toLowerCase()}/${entityId}/${Date.now()}-${uuidv4()}.${fileExt}`;
      
      // Upload the file to storage
      const { error: uploadError } = await supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .upload(fileKey, file, {
          contentType: file.type || `application/${fileExt}`,
          cacheControl: '3600'
        });
      
      if (uploadError) {
        console.error('Error uploading file to storage:', uploadError);
        throw uploadError;
      }
      
      // Create the document record
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          file_name: file.name,
          file_type: file.type,
          mime_type: file.type || `application/${fileExt}`,
          file_size: file.size,
          storage_path: fileKey,
          entity_type: entityType,
          entity_id: entityId,
          category: metadata.category || 'other',
          description: metadata.description,
          is_expense: metadata.isExpense,
          vendor_id: metadata.vendorId,
          vendor_type: metadata.vendorType,
          amount: metadata.amount,
          expense_date: metadata.expenseDate,
          expense_type: metadata.expenseType,
          notes: metadata.notes,
          tags: metadata.tags,
          version: metadata.version || 1,
          is_latest_version: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (documentError) {
        console.error('Error creating document record:', documentError);
        throw documentError;
      }
      
      // Get the public URL for the document
      const { data: urlData } = supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .getPublicUrl(fileKey);
      
      return {
        ...documentData,
        url: urlData.publicUrl
      };
    } catch (error) {
      console.error('Document upload failed:', error);
      return null;
    }
  },
  
  /**
   * Deletes a document by ID
   */
  deleteDocument: async (documentId: string): Promise<boolean> => {
    try {
      // First get the document to retrieve the storage path
      const { data, error } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('document_id', documentId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Delete the file from storage
      if (data.storage_path) {
        const { error: storageError } = await supabase.storage
          .from(DOCUMENTS_BUCKET_ID)
          .remove([data.storage_path]);
        
        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
          // Continue with document deletion even if storage deletion fails
        }
      }
      
      // Delete the document record
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', documentId);
      
      if (deleteError) {
        throw deleteError;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }
};
