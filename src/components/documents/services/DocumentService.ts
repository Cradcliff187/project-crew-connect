
import { supabase, DOCUMENTS_BUCKET_ID } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';

interface CreateDocumentArgs {
  file: File;
  entityType: string;
  entityId: string;
  metadata?: {
    category?: string;
    isExpense?: boolean;
    vendorId?: string;
    vendorType?: string;
    amount?: number;
    expenseDate?: Date;
    expenseType?: string;
    notes?: string;
    tags?: string[];
  };
}

interface DocumentResponse {
  success: boolean;
  document?: Document;
  error?: any;
}

export class DocumentService {
  static async uploadDocument(
    file: File, 
    entityType: string, 
    entityId: string, 
    metadata?: any
  ): Promise<Document | null> {
    try {
      console.log('Starting document upload process');
      
      // Create a unique file name using timestamp and original name
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      
      // Format entity type for path to ensure consistency
      const entityTypePath = entityType.toLowerCase().replace(/_/g, '-');
      const filePath = `${entityTypePath}/${entityId}/${fileName}`;
      
      console.log(`Uploading file to storage: ${filePath}`);
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .getPublicUrl(filePath);
        
      console.log('File uploaded successfully, public URL:', publicUrl);
      
      // Prepare metadata for document record
      const documentData = {
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: filePath,
        entity_type: entityType,
        entity_id: entityId,
        category: metadata?.category || 'other',
        is_expense: metadata?.isExpense || false,
        vendor_id: metadata?.vendorId || null,
        vendor_type: metadata?.vendorType || null,
        amount: metadata?.amount || null,
        expense_date: metadata?.expenseDate ? metadata?.expenseDate.toISOString() : null,
        expense_type: metadata?.expenseType || null,
        notes: metadata?.notes || null,
        tags: metadata?.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mime_type: file.type || `application/${fileExt}`,
        is_latest_version: true,
        version: 1
      };
      
      console.log('Creating document record with metadata:', documentData);
      
      // Insert document record into database
      const { data: document, error: insertError } = await supabase
        .from('documents')
        .insert(documentData)
        .select('*')
        .single();
        
      if (insertError) {
        console.error('Document record insert error:', insertError);
        throw insertError;
      }
      
      console.log('Document record created successfully:', document);
      
      return document;
    } catch (error) {
      console.error('Document upload error:', error);
      return null;
    }
  }
  
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
      
      // Get public URL for the document
      const { data: { publicUrl } } = supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .getPublicUrl(data.storage_path);
      
      return { ...data, url: publicUrl };
    } catch (error) {
      console.error('Error getting document by ID:', error);
      return null;
    }
  }
  
  static async createDocumentVersion(parentDocumentId: string, file: File, notes?: string): Promise<Document | null> {
    try {
      // First, get the parent document
      const parentDocument = await this.getDocumentById(parentDocumentId);
      
      if (!parentDocument) {
        throw new Error('Parent document not found');
      }
      
      // Get the current highest version number
      const { data: versionData, error: versionError } = await supabase
        .from('documents')
        .select('version')
        .or(`document_id.eq.${parentDocumentId},parent_document_id.eq.${parentDocumentId}`)
        .order('version', { ascending: false })
        .limit(1);
        
      if (versionError) {
        throw versionError;
      }
      
      // Calculate next version number
      const nextVersion = versionData && versionData.length > 0 
        ? (versionData[0].version || 1) + 1 
        : 1;
      
      console.log(`Creating new version ${nextVersion} for document ${parentDocumentId}`);
      
      // Create a unique file path for the new version
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `v${nextVersion}-${timestamp}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      
      // Use the same entity path as the parent
      const entityTypePath = parentDocument.entity_type.toLowerCase().replace(/_/g, '-');
      const entityId = parentDocument.entity_id;
      const filePath = `${entityTypePath}/${entityId}/${fileName}`;
      
      // Upload the new version to storage
      const { error: uploadError } = await supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Prepare document data for the new version
      const newVersionData = {
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: filePath,
        entity_type: parentDocument.entity_type,
        entity_id: parentDocument.entity_id,
        category: parentDocument.category,
        is_expense: parentDocument.is_expense,
        vendor_id: parentDocument.vendor_id,
        amount: parentDocument.amount,
        tags: parentDocument.tags,
        parent_document_id: parentDocumentId,
        version: nextVersion,
        notes: notes || `Version ${nextVersion}`,
        is_latest_version: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mime_type: file.type || `application/${fileExt}`
      };
      
      // Insert the new version record
      const { data: newVersion, error: insertError } = await supabase
        .from('documents')
        .insert(newVersionData)
        .select('*')
        .single();
        
      if (insertError) {
        throw insertError;
      }
      
      // Update the previous version(s) to not be the latest
      const { error: updateError } = await supabase
        .from('documents')
        .update({ is_latest_version: false })
        .eq('document_id', parentDocumentId);
        
      if (updateError) {
        console.error('Error updating parent document version status:', updateError);
      }
      
      return newVersion;
    } catch (error) {
      console.error('Error creating document version:', error);
      return null;
    }
  }
  
  static async deleteDocument(documentId: string): Promise<boolean> {
    try {
      // Get the document to delete
      const document = await this.getDocumentById(documentId);
      
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Delete the document record
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', documentId);
        
      if (deleteError) {
        throw deleteError;
      }
      
      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .remove([document.storage_path]);
        
      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }
}
