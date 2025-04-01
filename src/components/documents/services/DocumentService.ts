
import { supabase } from '@/integrations/supabase/client';
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
        .from('construction_documents')
        .getPublicUrl(data.storage_path);
      
      return { ...data, url: publicUrl };
    } catch (error) {
      console.error('Error fetching document:', error);
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
        .from('construction_documents')
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
  
  /**
   * Checks if a document has references in other tables
   */
  static async hasReferences(documentId: string): Promise<boolean> {
    try {
      // Check if document is referenced in project_expenses
      const { count: expenseCount, error: expenseError } = await supabase
        .from('expenses')
        .select('id', { count: 'exact' })
        .eq('document_id', documentId);
      
      if (expenseError) {
        throw expenseError;
      }
      
      // Check if document is referenced in estimate_items
      const { count: estimateItemCount, error: estimateItemError } = await supabase
        .from('estimate_items')
        .select('id', { count: 'exact' })
        .eq('document_id', documentId);
      
      if (estimateItemError) {
        throw estimateItemError;
      }
      
      // Check if document is referenced in change_orders
      const { count: changeOrderCount, error: changeOrderError } = await supabase
        .from('change_orders')
        .select('id', { count: 'exact' })
        .eq('document_id', documentId);
      
      if (changeOrderError) {
        throw changeOrderError;
      }
      
      return (expenseCount || 0) > 0 || 
             (estimateItemCount || 0) > 0 || 
             (changeOrderCount || 0) > 0;
    } catch (error) {
      console.error('Error checking document references:', error);
      return false;
    }
  }
  
  /**
   * Creates a new version of a document
   */
  static async createNewVersion(
    documentId: string, 
    file: File, 
    notes?: string
  ): Promise<Document | null> {
    try {
      // Get original document
      const originalDoc = await this.getDocumentById(documentId);
      
      if (!originalDoc) {
        throw new Error('Original document not found');
      }
      
      // Update original document to not be the latest version
      const { error: updateError } = await supabase
        .from('documents')
        .update({ is_latest_version: false })
        .eq('document_id', documentId);
      
      if (updateError) {
        throw updateError;
      }
      
      // Generate new storage path
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const newFileName = `${timestamp}_${file.name}`;
      const storagePath = `documents/${newFileName}`;
      
      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from('construction_documents')
        .upload(storagePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Create new document record
      const newVersion = (originalDoc.version || 1) + 1;
      
      const { data: newDoc, error: insertError } = await supabase
        .from('documents')
        .insert({
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: storagePath,
          entity_type: originalDoc.entity_type,
          entity_id: originalDoc.entity_id,
          category: originalDoc.category,
          parent_document_id: documentId,
          version: newVersion,
          is_latest_version: true,
          notes: notes || originalDoc.notes,
          tags: originalDoc.tags,
          vendor_id: originalDoc.vendor_id,
          is_expense: originalDoc.is_expense,
          expense_date: originalDoc.expense_date,
          amount: originalDoc.amount
        })
        .select('*')
        .single();
      
      if (insertError) {
        throw insertError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('construction_documents')
        .getPublicUrl(storagePath);
      
      return { ...newDoc, url: publicUrl };
    } catch (error) {
      console.error('Error creating new document version:', error);
      return null;
    }
  }
}
