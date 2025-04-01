
import { supabase, DOCUMENTS_BUCKET_ID } from '@/integrations/supabase/client';
import { Document, DocumentMetadata } from '../schemas/documentSchema';

/**
 * Service for managing document operations
 */
export class DocumentService {
  /**
   * Upload a document to storage and insert its metadata into the database
   */
  static async uploadDocument(
    file: File,
    entityType: string,
    entityId: string,
    metadata: Partial<DocumentMetadata> = {}
  ): Promise<Document | null> {
    try {
      // Create unique file path
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const entityTypePath = entityType.toLowerCase().replace(/_/g, '-');
      const filePath = `${entityTypePath}/${entityId}/${fileName}`;
      
      // Determine content type
      const contentType = file.type || `application/${fileExt}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .upload(filePath, file, {
          contentType,
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) throw uploadError;
      
      // Prepare document metadata
      const documentData = {
        file_name: file.name,
        file_type: contentType,
        file_size: file.size,
        storage_path: filePath,
        entity_type: entityType,
        entity_id: entityId,
        category: metadata.category || 'other',
        tags: metadata.tags || [],
        amount: metadata.amount || null,
        expense_date: metadata.expenseDate ? metadata.expenseDate.toISOString() : null,
        is_expense: metadata.isExpense || false,
        notes: metadata.notes || null,
        vendor_id: metadata.vendorId || null,
        vendor_type: metadata.vendorType || null,
        expense_type: metadata.expenseType || null,
        version: metadata.version || 1,
        is_latest_version: true,
        mime_type: contentType
      };
      
      // Insert document metadata
      const { data: insertedData, error: insertError } = await supabase
        .from('documents')
        .insert(documentData)
        .select('*')
        .single();
        
      if (insertError) throw insertError;
      
      return insertedData as Document;
    } catch (error) {
      console.error('Error in uploadDocument:', error);
      return null;
    }
  }
  
  /**
   * Get a document by ID with a signed URL
   */
  static async getDocumentById(documentId: string): Promise<Document | null> {
    try {
      // Fetch document metadata
      const { data: document, error } = await supabase
        .from('documents')
        .select('*')
        .eq('document_id', documentId)
        .single();
        
      if (error) throw error;
      if (!document) return null;
      
      // Get signed URL
      if (document.storage_path) {
        const { data: urlData } = await supabase.storage
          .from(DOCUMENTS_BUCKET_ID)
          .createSignedUrl(document.storage_path, 300, {
            download: false,
            transform: {
              width: 800,
              height: 800,
              quality: 80
            }
          });
          
        if (urlData) {
          return {
            ...document,
            url: urlData.signedUrl
          } as Document;
        }
      }
      
      return document as Document;
    } catch (error) {
      console.error('Error in getDocumentById:', error);
      return null;
    }
  }
  
  /**
   * Get documents by entity type and ID
   */
  static async getDocumentsByEntity(
    entityType: string,
    entityId: string
  ): Promise<Document[]> {
    try {
      const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);
        
      if (error) throw error;
      if (!documents || documents.length === 0) return [];
      
      // Get signed URLs for all documents
      const enhancedDocuments = await Promise.all(
        documents.map(async (doc) => {
          if (doc.storage_path) {
            const { data: urlData } = await supabase.storage
              .from(DOCUMENTS_BUCKET_ID)
              .createSignedUrl(doc.storage_path, 300);
              
            if (urlData) {
              return {
                ...doc,
                url: urlData.signedUrl
              };
            }
          }
          
          return doc;
        })
      );
      
      return enhancedDocuments as Document[];
    } catch (error) {
      console.error('Error in getDocumentsByEntity:', error);
      return [];
    }
  }
  
  /**
   * Create a new version of an existing document
   */
  static async createDocumentVersion(
    parentDocumentId: string,
    file: File,
    notes?: string
  ): Promise<Document | null> {
    try {
      // First, get the parent document
      const parentDocument = await this.getDocumentById(parentDocumentId);
      if (!parentDocument) {
        throw new Error(`Parent document with ID ${parentDocumentId} not found`);
      }
      
      // Determine the new version number
      const { data: versionData, error: versionError } = await supabase
        .from('documents')
        .select('MAX(version) as max_version')
        .eq('document_id', parentDocumentId)
        .or(`parent_document_id.eq.${parentDocumentId}`);
        
      if (versionError) throw versionError;
      
      const maxVersion = versionData?.[0]?.max_version || 1;
      const newVersion = maxVersion + 1;
      
      // Upload the new version with parent document's entity info
      const newVersionDoc = await this.uploadDocument(
        file,
        parentDocument.entity_type,
        parentDocument.entity_id,
        {
          category: parentDocument.category as any,
          tags: parentDocument.tags || [],
          notes: notes || `Version ${newVersion} of document ${parentDocument.file_name}`,
          version: newVersion,
          isExpense: parentDocument.is_expense,
          vendorId: parentDocument.vendor_id,
          vendorType: parentDocument.vendor_type as any,
          expenseType: parentDocument.expense_type as any,
        }
      );
      
      if (!newVersionDoc) {
        throw new Error('Failed to create the new document version');
      }
      
      // Update the new document to link it to the parent
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          parent_document_id: parentDocumentId,
          is_latest_version: true
        })
        .eq('document_id', newVersionDoc.document_id);
        
      if (updateError) throw updateError;
      
      // Update the parent document to no longer be the latest version
      const { error: parentUpdateError } = await supabase
        .from('documents')
        .update({
          is_latest_version: false
        })
        .eq('document_id', parentDocumentId);
      
      if (parentUpdateError) throw parentUpdateError;
      
      // Return the new document version with the updated fields
      return {
        ...newVersionDoc,
        parent_document_id: parentDocumentId,
        is_latest_version: true
      };
      
    } catch (error) {
      console.error('Error in createDocumentVersion:', error);
      return null;
    }
  }
  
  /**
   * Get documents with the same parent document ID
   */
  static async getDocumentsWithParent(
    parentDocumentId: string
  ): Promise<{ data: Document[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('parent_document_id', parentDocumentId);
        
      if (error) throw error;
      
      // Get signed URLs for all documents
      if (data && data.length > 0) {
        const enhancedDocuments = await Promise.all(
          data.map(async (doc) => {
            if (doc.storage_path) {
              const { data: urlData } = await supabase.storage
                .from(DOCUMENTS_BUCKET_ID)
                .createSignedUrl(doc.storage_path, 300);
                
              if (urlData) {
                return {
                  ...doc,
                  url: urlData.signedUrl
                };
              }
            }
            
            return doc;
          })
        );
        
        return { data: enhancedDocuments as Document[], error: null };
      }
      
      return { data: data as Document[] || [], error: null };
    } catch (error: any) {
      console.error('Error in getDocumentsWithParent:', error);
      return { data: null, error };
    }
  }
  
  /**
   * Delete a document by ID
   */
  static async deleteDocument(documentId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      // Check if document exists
      const document = await this.getDocumentById(documentId);
      if (!document) {
        return { success: false, error: new Error('Document not found') };
      }
      
      // Check for references to this document in other tables
      const hasReferences = await this.checkDocumentReferences(documentId);
      if (hasReferences) {
        return { 
          success: false, 
          error: new Error('Document is referenced by other records and cannot be deleted') 
        };
      }
      
      // Delete file from storage
      if (document.storage_path) {
        const { error: storageError } = await supabase.storage
          .from(DOCUMENTS_BUCKET_ID)
          .remove([document.storage_path]);
          
        if (storageError) throw storageError;
      }
      
      // Delete document metadata
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', documentId);
        
      if (deleteError) throw deleteError;
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error in deleteDocument:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Check if a document is referenced by other records
   */
  static async checkDocumentReferences(documentId: string): Promise<boolean> {
    try {
      // Check estimates
      const { count: estimateCount, error: estimateError } = await supabase
        .from('estimates')
        .select('estimateid', { count: 'exact', head: true })
        .eq('docid', documentId);
        
      if (estimateError) throw estimateError;
      if (estimateCount && estimateCount > 0) return true;
      
      // Check estimate_items
      const { count: estimateItemCount, error: estimateItemError } = await supabase
        .from('estimate_items')
        .select('id', { count: 'exact', head: true })
        .eq('document_id', documentId);
        
      if (estimateItemError) throw estimateItemError;
      if (estimateItemCount && estimateItemCount > 0) return true;
      
      // Check change_orders
      const { count: changeOrderCount, error: changeOrderError } = await supabase
        .from('change_orders')
        .select('id', { count: 'exact', head: true })
        .eq('document_id', documentId);
        
      if (changeOrderError) throw changeOrderError;
      if (changeOrderCount && changeOrderCount > 0) return true;
      
      // Check change_order_items
      const { count: changeOrderItemCount, error: changeOrderItemError } = await supabase
        .from('change_order_items')
        .select('id', { count: 'exact', head: true })
        .eq('document_id', documentId);
        
      if (changeOrderItemError) throw changeOrderItemError;
      if (changeOrderItemCount && changeOrderItemCount > 0) return true;
      
      // Check expenses
      const { count: expenseCount, error: expenseError } = await supabase
        .from('expenses')
        .select('id', { count: 'exact', head: true })
        .eq('document_id', documentId);
        
      if (expenseError) throw expenseError;
      if (expenseCount && expenseCount > 0) return true;
      
      return false;
    } catch (error) {
      console.error('Error in checkDocumentReferences:', error);
      return true; // Assume references exist if we can't check
    }
  }
}
