
import { supabase, DOCUMENTS_BUCKET_ID } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';

export class DocumentService {
  /**
   * Fetches a document by ID and includes a public URL
   */
  static async getDocumentById(documentId: string): Promise<Document | null> {
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
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .getPublicUrl(data.storage_path);
      
      return { ...data, url: publicUrl };
    } catch (error) {
      console.error('Error fetching document:', error);
      return null;
    }
  }
  
  /**
   * Uploads a document and creates the associated metadata
   */
  static async uploadDocument(
    file: File,
    entityType: string,
    entityId: string,
    metadata: {
      category?: string;
      isExpense?: boolean;
      vendorId?: string;
      vendorType?: string;
      amount?: number;
      expenseDate?: Date;
      expenseType?: string;
      notes?: string;
      tags?: string[];
    }
  ): Promise<Document | null> {
    try {
      // Create a unique file name using timestamp and original name
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      
      const entityTypePath = entityType.toLowerCase().replace(/_/g, '-');
      const filePath = `${entityTypePath}/${entityId}/${fileName}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .getPublicUrl(filePath);
        
      // Insert document metadata to database
      const documentData = {
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: filePath,
        entity_type: entityType,
        entity_id: entityId,
        tags: metadata.tags || [],
        category: metadata.category,
        amount: metadata.amount || null,
        expense_date: metadata.expenseDate ? metadata.expenseDate.toISOString() : null,
        version: 1,
        is_expense: metadata.isExpense || false,
        notes: metadata.notes || null,
        vendor_id: metadata.vendorId || null,
        vendor_type: metadata.vendorType || null,
        expense_type: metadata.expenseType || null,
      };
      
      const { data: insertedData, error: insertError } = await supabase
        .from('documents')
        .insert(documentData)
        .select('*')
        .single();
        
      if (insertError) {
        throw insertError;
      }
      
      return { ...insertedData, url: publicUrl };
    } catch (error) {
      console.error('Error uploading document:', error);
      return null;
    }
  }
  
  /**
   * Creates a new version of an existing document
   */
  static async createNewVersion(
    documentId: string,
    file: File,
    notes?: string
  ): Promise<Document | null> {
    try {
      // Get the original document
      const { data: originalDoc, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('document_id', documentId)
        .single();
        
      if (fetchError) {
        throw fetchError;
      }
      
      if (!originalDoc) {
        throw new Error('Original document not found');
      }
      
      // Upload the new version file
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      
      const entityTypePath = originalDoc.entity_type.toLowerCase().replace(/_/g, '-');
      const filePath = `${entityTypePath}/${originalDoc.entity_id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Calculate new version number
      let newVersion = 1;
      
      // If the original document has a parent, it means it's already a version
      const parentId = originalDoc.parent_document_id || originalDoc.document_id;
      
      // Get all existing versions to determine the next version number
      const { data: existingVersions, error: versionsError } = await supabase
        .from('documents')
        .select('version')
        .or(`document_id.eq.${parentId},parent_document_id.eq.${parentId}`);
        
      if (versionsError) {
        throw versionsError;
      }
      
      if (existingVersions && existingVersions.length > 0) {
        const versions = existingVersions.map(v => v.version || 1);
        newVersion = Math.max(...versions) + 1;
      }
      
      // Insert the new version
      const newVersionData = {
        ...originalDoc,
        document_id: undefined, // Let Supabase generate a new ID
        parent_document_id: parentId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: filePath,
        version: newVersion,
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data: insertedData, error: insertError } = await supabase
        .from('documents')
        .insert(newVersionData)
        .select('*')
        .single();
        
      if (insertError) {
        throw insertError;
      }
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .getPublicUrl(filePath);
        
      return { ...insertedData, url: publicUrl };
    } catch (error) {
      console.error('Error creating document version:', error);
      return null;
    }
  }
  
  /**
   * Deletes a document from storage and database
   */
  static async deleteDocument(documentId: string): Promise<boolean> {
    try {
      // First, get the document to find its storage path
      const { data, error } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('document_id', documentId)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error('Document not found');
      }
      
      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .remove([data.storage_path]);
      
      if (storageError) {
        throw storageError;
      }
      
      // Delete the database record
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
}
