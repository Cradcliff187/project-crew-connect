
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
}
