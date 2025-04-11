
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import { 
  EntityType, 
  DocumentCategory, 
  Document, 
  RelationshipType, 
  DocumentUploadResult 
} from '@/components/documents/schemas/documentSchema';
import { parseEntityType } from '@/components/documents/utils/documentTypeUtils';

/**
 * Document upload metadata
 */
export interface DocumentUploadMetadata {
  entityType: EntityType;
  entityId: string;
  category?: DocumentCategory | string;
  tags?: string[];
  notes?: string;
  isExpense?: boolean;
  amount?: number | null;
  expenseDate?: Date | string | null;
  vendorId?: string | null;
  vendorType?: string | null;
  expenseType?: string | null;
  budgetItemId?: string | null;
  parentEntityType?: EntityType;
  parentEntityId?: string;
}

/**
 * Standardized document service for all document operations
 */
export const documentService = {
  /**
   * Upload a document with metadata
   */
  uploadDocument: async (file: File, metadata: DocumentUploadMetadata): Promise<DocumentUploadResult> => {
    try {
      // Generate a unique document ID
      const documentId = uuidv4();
      
      // Generate a standardized storage path for better organization and consistency
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const formattedEntityType = metadata.entityType.toLowerCase().replace(/_/g, '-');
      const entityId = metadata.entityId || 'general';
      const filePath = `${formattedEntityType}/${entityId}/${documentId}_${timestamp}_${file.name}`;
      
      // Upload the file to Supabase storage
      const { error: storageError } = await supabase.storage
        .from('construction_documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (storageError) {
        console.error('Storage error:', storageError);
        return {
          success: false,
          error: storageError,
          message: `Failed to upload file: ${storageError.message}`
        };
      }
      
      // Format the expense date properly if provided
      let expenseDate = null;
      if (metadata.expenseDate) {
        expenseDate = metadata.expenseDate instanceof Date
          ? metadata.expenseDate.toISOString()
          : new Date(metadata.expenseDate).toISOString();
      }
      
      // Insert document metadata into the database
      const { data: documentData, error: dbError } = await supabase
        .from('documents')
        .insert({
          document_id: documentId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: filePath,
          entity_type: metadata.entityType,
          entity_id: metadata.entityId,
          category: metadata.category,
          tags: metadata.tags || [],
          notes: metadata.notes,
          is_expense: metadata.isExpense || false,
          amount: metadata.amount,
          expense_date: expenseDate,
          vendor_id: metadata.vendorId,
          vendor_type: metadata.vendorType,
          expense_type: metadata.expenseType,
          budget_item_id: metadata.budgetItemId,
          version: 1,
          is_latest_version: true
        })
        .select()
        .single();
      
      if (dbError) {
        console.error('Database error:', dbError);
        // Clean up the uploaded file if database insert fails
        await supabase.storage
          .from('construction_documents')
          .remove([filePath]);
          
        return {
          success: false,
          error: dbError,
          message: `Failed to create document record: ${dbError.message}`
        };
      }
      
      // Get URL for the document
      const { data: urlData } = await supabase.storage
        .from('construction_documents')
        .getPublicUrl(filePath);
      
      // Return success response with document ID
      return {
        success: true,
        documentId,
        document: {
          ...documentData as Document,
          url: urlData.publicUrl,
          entity_type: metadata.entityType
        }
      };
    } catch (error: any) {
      console.error('Document upload failed:', error);
      return {
        success: false,
        error,
        message: error.message || 'Failed to upload document'
      };
    }
  },

  /**
   * Get documents by entity type and ID
   */
  getDocumentsByEntity: async (entityType: EntityType, entityId: string): Promise<Document[]> => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process the documents to ensure entity_type is the correct enum
      const documents = data.map(doc => ({
        ...doc,
        entity_type: parseEntityType(doc.entity_type)
      })) as Document[];
      
      // Get URLs for all documents
      const documentsWithUrls = await Promise.all(
        documents.map(async (doc) => {
          const { data } = await supabase.storage
            .from('construction_documents')
            .getPublicUrl(doc.storage_path);
          
          return {
            ...doc,
            url: data.publicUrl
          };
        })
      );
      
      return documentsWithUrls;
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive'
      });
      return [];
    }
  },
  
  /**
   * Get document by ID
   */
  getDocumentById: async (documentId: string): Promise<Document | null> => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('document_id', documentId)
        .single();
      
      if (error) throw error;
      
      // Get URL for the document
      const { data: urlData } = await supabase.storage
        .from('construction_documents')
        .getPublicUrl(data.storage_path);
      
      // Process the document to ensure entity_type is the correct enum
      const document: Document = {
        ...data,
        url: urlData.publicUrl,
        entity_type: parseEntityType(data.entity_type)
      };
      
      return document;
    } catch (error: any) {
      console.error('Error fetching document:', error);
      return null;
    }
  },
  
  /**
   * Delete document by ID
   */
  deleteDocument: async (documentId: string): Promise<boolean> => {
    try {
      // Get the document to retrieve the storage path
      const { data, error } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('document_id', documentId)
        .single();
      
      if (error) throw error;
      
      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('construction_documents')
        .remove([data.storage_path]);
      
      if (storageError) throw storageError;
      
      // Delete the document record
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', documentId);
      
      if (dbError) throw dbError;
      
      return true;
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive'
      });
      return false;
    }
  },
  
  /**
   * Update document metadata
   */
  updateDocumentMetadata: async (documentId: string, metadata: Partial<DocumentUploadMetadata>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          category: metadata.category,
          tags: metadata.tags,
          notes: metadata.notes,
          is_expense: metadata.isExpense,
          amount: metadata.amount,
          expense_date: metadata.expenseDate instanceof Date 
            ? metadata.expenseDate.toISOString() 
            : metadata.expenseDate,
          vendor_id: metadata.vendorId,
          vendor_type: metadata.vendorType,
          expense_type: metadata.expenseType,
          updated_at: new Date().toISOString()
        })
        .eq('document_id', documentId);
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Error updating document metadata:', error);
      toast({
        title: 'Error',
        description: 'Failed to update document',
        variant: 'destructive'
      });
      return false;
    }
  },
  
  /**
   * Create a document relationship
   */
  createRelationship: async (
    sourceDocumentId: string, 
    targetDocumentId: string, 
    relationshipType: RelationshipType
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('document_relationships')
        .insert({
          source_document_id: sourceDocumentId,
          target_document_id: targetDocumentId,
          relationship_type: relationshipType,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Error creating document relationship:', error);
      toast({
        title: 'Error',
        description: 'Failed to create document relationship',
        variant: 'destructive'
      });
      return false;
    }
  }
};

export default documentService;
