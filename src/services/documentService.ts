
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

/**
 * Standard document type used across the application
 */
export interface Document {
  document_id: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  storage_path: string;
  entity_type: EntityType;
  entity_id: string;
  category?: string | null;
  tags?: string[];
  notes?: string | null;
  is_expense?: boolean;
  amount?: number | null;
  expense_date?: string | null;
  vendor_id?: string | null;
  vendor_type?: string | null;
  expense_type?: string | null;
  budget_item_id?: string | null;
  version?: number;
  is_latest_version?: boolean;
  parent_document_id?: string | null;
  url?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Standard entity types used for document relationships
 * Always use uppercase for consistency
 */
export type EntityType = 
  | 'PROJECT'
  | 'WORK_ORDER' 
  | 'ESTIMATE' 
  | 'ESTIMATE_ITEM'
  | 'CUSTOMER' 
  | 'VENDOR' 
  | 'CONTACT'
  | 'SUBCONTRACTOR' 
  | 'EXPENSE' 
  | 'TIME_ENTRY' 
  | 'EMPLOYEE'
  | 'BUDGET_ITEM'
  | 'CHANGE_ORDER'
  | 'DETACHED';

/**
 * Document upload metadata
 */
export interface DocumentUploadMetadata {
  entityType: EntityType;
  entityId: string;
  category?: string;
  tags?: string[];
  notes?: string;
  isExpense?: boolean;
  amount?: number;
  expenseDate?: Date | string;
  vendorId?: string;
  vendorType?: string;
  expenseType?: string;
  budgetItemId?: string;
  parentEntityType?: EntityType;
  parentEntityId?: string;
}

/**
 * Result of document operations
 */
export interface DocumentResult {
  success: boolean;
  documentId?: string;
  error?: Error | string;
  message?: string;
  document?: Document;
}

/**
 * Standardized document service for all document operations
 */
export const documentService = {
  /**
   * Upload a document with metadata
   */
  uploadDocument: async (file: File, metadata: DocumentUploadMetadata): Promise<DocumentResult> => {
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
      
      // Create relationship to parent entity if specified
      if (metadata.parentEntityType && metadata.parentEntityId) {
        await supabase
          .from('document_relationships')
          .insert({
            source_document_id: documentId,
            target_document_id: null,
            relationship_type: 'PARENT_ENTITY',
            relationship_metadata: {
              parent_entity_type: metadata.parentEntityType,
              parent_entity_id: metadata.parentEntityId,
              description: 'Document belongs to this parent entity'
            }
          });
      }
      
      // Get the public URL for the document
      const { data: urlData } = await supabase.storage
        .from('construction_documents')
        .getPublicUrl(filePath);
      
      const document: Document = {
        ...documentData,
        url: urlData.publicUrl
      };
      
      return {
        success: true,
        documentId,
        document,
        message: 'Document uploaded successfully'
      };
    } catch (error: any) {
      console.error('Document upload error:', error);
      return {
        success: false,
        error,
        message: error.message || 'An unexpected error occurred during upload'
      };
    }
  },
  
  /**
   * Fetch a document by ID
   */
  getDocumentById: async (documentId: string): Promise<DocumentResult> => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('document_id', documentId)
        .single();
      
      if (error) {
        return {
          success: false,
          error,
          message: `Failed to retrieve document: ${error.message}`
        };
      }
      
      if (!data) {
        return {
          success: false,
          message: 'Document not found'
        };
      }
      
      // Get the URL for the document
      const { data: urlData } = await supabase.storage
        .from('construction_documents')
        .getPublicUrl(data.storage_path);
      
      const document: Document = {
        ...data,
        url: urlData.publicUrl
      };
      
      return {
        success: true,
        document,
        documentId
      };
    } catch (error: any) {
      return {
        success: false,
        error,
        message: error.message || 'Failed to retrieve document'
      };
    }
  },
  
  /**
   * Fetch documents by entity
   */
  getDocumentsByEntity: async (entityType: EntityType, entityId: string): Promise<Document[]> => {
    try {
      // Ensure consistent uppercase entity type
      const normalizedEntityType = entityType.toUpperCase() as EntityType;
      
      // Fetch documents from the database
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', normalizedEntityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching documents:', error);
        return [];
      }
      
      // Enhance documents with URLs
      const documentsWithUrls = await Promise.all(
        (data || []).map(async (doc) => {
          const { data: urlData } = await supabase.storage
            .from('construction_documents')
            .getPublicUrl(doc.storage_path);
          
          return {
            ...doc,
            url: urlData.publicUrl
          } as Document;
        })
      );
      
      return documentsWithUrls;
    } catch (error) {
      console.error('Error in getDocumentsByEntity:', error);
      return [];
    }
  },
  
  /**
   * Delete a document from both storage and database
   */
  deleteDocument: async (documentId: string): Promise<DocumentResult> => {
    try {
      // First, get the document to find its storage path
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('document_id', documentId)
        .single();
      
      if (fetchError) {
        return {
          success: false,
          error: fetchError,
          message: `Failed to find document: ${fetchError.message}`
        };
      }
      
      // Delete the file from storage
      if (document?.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('construction_documents')
          .remove([document.storage_path]);
        
        if (storageError) {
          console.error('Error removing file from storage:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }
      
      // Delete document relationships
      await supabase
        .from('document_relationships')
        .delete()
        .or(`source_document_id.eq.${documentId},target_document_id.eq.${documentId}`);
      
      // Delete the document record from the database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', documentId);
      
      if (dbError) {
        return {
          success: false,
          error: dbError,
          message: `Failed to delete document: ${dbError.message}`
        };
      }
      
      return {
        success: true,
        message: 'Document deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error,
        message: error.message || 'Failed to delete document'
      };
    }
  },
  
  /**
   * Create a new version of an existing document
   */
  createNewVersion: async (
    parentDocumentId: string,
    file: File,
    metadata: Partial<DocumentUploadMetadata>
  ): Promise<DocumentResult> => {
    try {
      // First, get the parent document details
      const { data: parentDoc, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('document_id', parentDocumentId)
        .single();
      
      if (fetchError || !parentDoc) {
        return {
          success: false,
          error: fetchError || new Error('Parent document not found'),
          message: 'Failed to find parent document'
        };
      }
      
      // Generate a unique ID for the new version
      const documentId = uuidv4();
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      
      // Use the same entity information as the parent document
      const entityType = parentDoc.entity_type as EntityType;
      const entityId = parentDoc.entity_id;
      const formattedEntityType = entityType.toLowerCase().replace(/_/g, '-');
      
      // Create a storage path that indicates this is a version
      const filePath = `${formattedEntityType}/${entityId}/versions/${documentId}_${timestamp}_${file.name}`;
      
      // Upload the new file
      const { error: storageError } = await supabase.storage
        .from('construction_documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (storageError) {
        return {
          success: false,
          error: storageError,
          message: `Failed to upload file: ${storageError.message}`
        };
      }
      
      // Calculate the new version number
      const newVersion = (parentDoc.version || 1) + 1;
      
      // Insert the new document version
      const { data: documentData, error: dbError } = await supabase
        .from('documents')
        .insert({
          document_id: documentId,
          parent_document_id: parentDocumentId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: filePath,
          entity_type: entityType,
          entity_id: entityId,
          category: metadata.category || parentDoc.category,
          tags: metadata.tags || parentDoc.tags,
          notes: metadata.notes || parentDoc.notes,
          is_expense: parentDoc.is_expense,
          amount: parentDoc.amount,
          expense_date: parentDoc.expense_date,
          vendor_id: parentDoc.vendor_id,
          vendor_type: parentDoc.vendor_type,
          expense_type: parentDoc.expense_type,
          budget_item_id: parentDoc.budget_item_id,
          version: newVersion,
          is_latest_version: true
        })
        .select()
        .single();
      
      if (dbError) {
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
      
      // Update the parent document to no longer be the latest version
      await supabase
        .from('documents')
        .update({ is_latest_version: false })
        .eq('document_id', parentDocumentId);
      
      // Get the public URL for the document
      const { data: urlData } = await supabase.storage
        .from('construction_documents')
        .getPublicUrl(filePath);
      
      const document: Document = {
        ...documentData,
        url: urlData.publicUrl
      };
      
      return {
        success: true,
        documentId,
        document,
        message: `Document version ${newVersion} created successfully`
      };
    } catch (error: any) {
      console.error('Error creating new document version:', error);
      return {
        success: false,
        error,
        message: error.message || 'Failed to create new document version'
      };
    }
  },
  
  /**
   * Get all versions of a document
   */
  getDocumentVersions: async (documentId: string): Promise<Document[]> => {
    try {
      // First, get the original document to find its parent or children
      const { data: originalDoc, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('document_id', documentId)
        .single();
      
      if (fetchError || !originalDoc) {
        console.error('Error fetching original document:', fetchError);
        return [];
      }
      
      let rootDocId: string;
      
      // If this is a child version, get its parent ID
      if (originalDoc.parent_document_id) {
        rootDocId = originalDoc.parent_document_id;
      } else {
        // This is the root document
        rootDocId = documentId;
      }
      
      // Get all versions of this document (parent + all children)
      const { data: versions, error: versionsError } = await supabase
        .from('documents')
        .select('*')
        .or(`document_id.eq.${rootDocId},parent_document_id.eq.${rootDocId}`)
        .order('version', { ascending: false });
      
      if (versionsError) {
        console.error('Error fetching document versions:', versionsError);
        return [];
      }
      
      // Enhance documents with URLs
      const versionsWithUrls = await Promise.all(
        (versions || []).map(async (doc) => {
          const { data: urlData } = await supabase.storage
            .from('construction_documents')
            .getPublicUrl(doc.storage_path);
          
          return {
            ...doc,
            url: urlData.publicUrl
          } as Document;
        })
      );
      
      return versionsWithUrls;
    } catch (error) {
      console.error('Error in getDocumentVersions:', error);
      return [];
    }
  },
  
  /**
   * Attach/link an existing document to an entity
   */
  attachDocumentToEntity: async (
    documentId: string, 
    entityType: EntityType, 
    entityId: string
  ): Promise<DocumentResult> => {
    try {
      // Update the document with the new entity information
      const { data, error } = await supabase
        .from('documents')
        .update({
          entity_type: entityType,
          entity_id: entityId,
          updated_at: new Date().toISOString()
        })
        .eq('document_id', documentId)
        .select()
        .single();
      
      if (error) {
        return {
          success: false,
          error,
          message: `Failed to attach document: ${error.message}`
        };
      }
      
      return {
        success: true,
        document: data as Document,
        documentId,
        message: 'Document attached successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error,
        message: error.message || 'Failed to attach document'
      };
    }
  }
};

/**
 * Helper function to get a signed URL for a document
 * More secure than public URLs for sensitive documents
 */
export const getSignedDocumentUrl = async (
  storagePath: string, 
  options: { download?: boolean; expiresIn?: number } = {}
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('construction_documents')
      .createSignedUrl(
        storagePath, 
        options.expiresIn || 60 * 5, // Default 5 minutes
        { download: options.download }
      );
    
    if (error || !data) {
      console.error('Error creating signed URL:', error);
      return null;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error in getSignedDocumentUrl:', error);
    return null;
  }
};

/**
 * Helper function to categorize documents by their category
 */
export const categorizeDocuments = (documents: Document[]): Record<string, Document[]> => {
  const categories: Record<string, Document[]> = {
    'receipts': [],
    'invoices': [],
    'contracts': [],
    'photos': [],
    'general': [],
    'other': []
  };
  
  for (const doc of documents) {
    const category = doc.category?.toLowerCase() || 'other';
    
    if (categories[category]) {
      categories[category].push(doc);
    } else {
      categories['other'].push(doc);
    }
  }
  
  return categories;
};

/**
 * Helper function to get a file icon based on file type
 */
export const getFileIcon = (fileType: string | null): string => {
  if (!fileType) return 'file';
  
  if (fileType.includes('image')) return 'image';
  if (fileType.includes('pdf')) return 'file-pdf';
  if (fileType.includes('word') || fileType.includes('document')) return 'file-text';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'file-spreadsheet';
  if (fileType.includes('text')) return 'file-text';
  if (fileType.includes('zip') || fileType.includes('compressed')) return 'archive';
  
  return 'file';
};

/**
 * Helper function to format file size
 */
export const formatFileSize = (sizeInBytes: number | null): string => {
  if (sizeInBytes === null || sizeInBytes === undefined) return 'Unknown size';
  
  if (sizeInBytes < 1024) return `${sizeInBytes} bytes`;
  if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  
  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
};
