
import { supabase, DOCUMENTS_BUCKET_ID } from '@/integrations/supabase/client';
import { Document, EntityType } from '../schemas/documentSchema';

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
}

interface SignedUrlOptions {
  imageOptions?: ImageOptions;
  expiresIn?: number; // in seconds
}

interface UploadOptions {
  onProgress?: (progress: number) => void;
  customPath?: string;
}

/**
 * A unified service for handling document operations across the application
 */
export class DocumentService {
  /**
   * Upload a file to the document storage
   */
  static async uploadDocument(
    file: File,
    entityType: EntityType,
    entityId: string,
    metadata: {
      category?: string;
      isExpense?: boolean;
      vendorId?: string;
      vendorType?: string;
      amount?: number;
      notes?: string;
      tags?: string[];
      expenseDate?: string;
      expenseType?: string;
      parent_document_id?: string;
    } = {}
  ): Promise<Document | null> {
    try {
      if (!file || !entityType || !entityId) {
        console.error('Missing required parameters for document upload');
        return null;
      }

      // Generate a unique file path
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 9);
      const fileName = `${timestamp}_${randomString}.${fileExt}`;
      
      // Create a logical folder structure for organization
      const basePath = entityType.toLowerCase();
      const filePath = `${basePath}/${entityId}/${fileName}`;
      
      console.log('Uploading file to path:', filePath);
      
      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error(`Error uploading file: ${uploadError.message}`);
      }
      
      // Create a document record in the database
      const documentData = {
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: filePath,
        entity_type: entityType,
        entity_id: entityId,
        category: metadata.category || 'other',
        is_expense: metadata.isExpense || false,
        amount: metadata.amount,
        vendor_id: metadata.vendorId,
        vendor_type: metadata.vendorType,
        notes: metadata.notes,
        tags: metadata.tags || [],
        expense_date: metadata.expenseDate,
        expense_type: metadata.expenseType,
        parent_document_id: metadata.parent_document_id,
        is_latest_version: true,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: document, error: documentError } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();
      
      if (documentError) {
        console.error('Error creating document record:', documentError);
        throw new Error(`Error creating document record: ${documentError.message}`);
      }
      
      console.log('Document uploaded and record created:', document);
      return document;
    } catch (error: any) {
      console.error('Error in uploadDocument:', error);
      return null;
    }
  }

  /**
   * Generate a signed URL for a document with optional transformations
   */
  static async getSignedUrl(
    storagePath: string,
    options: SignedUrlOptions = {}
  ): Promise<string | null> {
    try {
      if (!storagePath) {
        console.error('Storage path is required for getting a signed URL');
        return null;
      }

      // Default expiration time is 5 minutes (300 seconds)
      const expiresIn = options.expiresIn || 300;
      
      // For images, we can use transformation options
      if (options.imageOptions && storagePath.match(/\.(jpe?g|png|gif|webp)$/i)) {
        const { data, error } = await supabase.storage
          .from(DOCUMENTS_BUCKET_ID)
          .createSignedUrl(
            storagePath, 
            expiresIn,
            {
              transform: {
                width: options.imageOptions.width,
                height: options.imageOptions.height,
                quality: options.imageOptions.quality || 80
              }
            }
          );
          
        if (error) {
          console.error('Error generating signed URL with transformations:', error);
          return null;
        }
        
        return data.signedUrl;
      } else {
        // For non-images, just get a regular signed URL
        const { data, error } = await supabase.storage
          .from(DOCUMENTS_BUCKET_ID)
          .createSignedUrl(storagePath, expiresIn);
          
        if (error) {
          console.error('Error generating signed URL:', error);
          return null;
        }
        
        return data.signedUrl;
      }
    } catch (error) {
      console.error('Error in getSignedUrl:', error);
      return null;
    }
  }

  /**
   * Fetch document by ID with optional signed URL
   */
  static async getDocumentById(documentId: string, withUrl: boolean = true): Promise<Document | null> {
    try {
      const { data: document, error } = await supabase
        .from('documents')
        .select('*')
        .eq('document_id', documentId)
        .single();
        
      if (error) {
        console.error('Error fetching document:', error);
        return null;
      }
      
      if (!document) {
        console.error('Document not found');
        return null;
      }
      
      // If URL is requested and document has a storage path
      if (withUrl && document.storage_path) {
        const url = await this.getSignedUrl(document.storage_path);
        return { ...document, url: url || '' } as Document;
      }
      
      return document as Document;
    } catch (error) {
      console.error('Error in getDocumentById:', error);
      return null;
    }
  }

  /**
   * Fetch multiple documents by entity
   */
  static async getDocumentsByEntity(
    entityType: EntityType,
    entityId: string,
    withUrls: boolean = true
  ): Promise<Document[]> {
    try {
      const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);
        
      if (error) {
        console.error('Error fetching documents by entity:', error);
        return [];
      }
      
      if (!documents || documents.length === 0) {
        return [];
      }
      
      // Generate signed URLs if requested
      if (withUrls) {
        const docsWithUrls = await Promise.all(
          documents.map(async (doc) => {
            if (doc.storage_path) {
              const url = await this.getSignedUrl(doc.storage_path);
              return { ...doc, url: url || '' } as Document;
            }
            return { ...doc, url: '' } as Document;
          })
        );
        
        return docsWithUrls;
      }
      
      return documents as Document[];
    } catch (error) {
      console.error('Error in getDocumentsByEntity:', error);
      return [];
    }
  }

  /**
   * Delete a document, including the file in storage
   */
  static async deleteDocument(documentId: string): Promise<boolean> {
    try {
      // First, get the document to get the storage path
      const document = await this.getDocumentById(documentId, false);
      
      if (!document) {
        console.error('Document not found for deletion');
        return false;
      }
      
      // If it has a storage path, delete the file from storage
      if (document.storage_path) {
        const { error: storageError } = await supabase.storage
          .from(DOCUMENTS_BUCKET_ID)
          .remove([document.storage_path]);
          
        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
          // Continue with deleting the record even if file deletion fails
        }
      }
      
      // Delete the document record
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', documentId);
        
      if (deleteError) {
        console.error('Error deleting document record:', deleteError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteDocument:', error);
      return false;
    }
  }

  /**
   * Update document metadata
   */
  static async updateDocumentMetadata(
    documentId: string,
    metadata: Partial<Document>
  ): Promise<Document | null> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update({
          ...metadata,
          updated_at: new Date().toISOString()
        })
        .eq('document_id', documentId)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating document metadata:', error);
        return null;
      }
      
      return data as Document;
    } catch (error) {
      console.error('Error in updateDocumentMetadata:', error);
      return null;
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
      // Get the parent document
      const parentDoc = await this.getDocumentById(parentDocumentId, false);
      
      if (!parentDoc) {
        console.error('Parent document not found');
        return null;
      }
      
      // Get the highest current version
      const { data: versions, error: versionsError } = await supabase
        .from('documents')
        .select('version')
        .or(`document_id.eq.${parentDocumentId},parent_document_id.eq.${parentDocumentId}`)
        .order('version', { ascending: false })
        .limit(1);
        
      if (versionsError) {
        console.error('Error fetching document versions:', versionsError);
        return null;
      }
      
      const nextVersion = versions && versions.length > 0 ? (versions[0].version + 1) : 2;
      
      // Upload the new version
      return await this.uploadDocument(file, parentDoc.entity_type, parentDoc.entity_id, {
        category: parentDoc.category,
        isExpense: parentDoc.is_expense,
        vendorId: parentDoc.vendor_id,
        vendorType: parentDoc.vendor_type,
        tags: parentDoc.tags,
        notes,
        parent_document_id: parentDocumentId
      });
    } catch (error) {
      console.error('Error in createDocumentVersion:', error);
      return null;
    }
  }
}
