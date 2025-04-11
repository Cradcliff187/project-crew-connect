
import { supabase } from '@/integrations/supabase/client';

interface UploadMetadata {
  entityType: string;
  entityId: string;
  category?: string;
  isExpense?: boolean;
  amount?: number;
  expenseDate?: Date;
  vendorId?: string;
  vendorType?: string;
  expenseType?: string;
  budgetItemId?: string;
  tags?: string[];
  notes?: string;
  version?: number;
  parentEntityType?: string;
  parentEntityId?: string;
}

interface UploadResult {
  success: boolean;
  documentId?: string;
  message?: string;
}

export const documentService = {
  /**
   * Upload a document to Supabase storage and create a record in the documents table
   */
  uploadDocument: async (file: File, metadata: UploadMetadata): Promise<UploadResult> => {
    try {
      // Create a unique file name using timestamp and original name
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      
      // Format entity type for path to ensure consistency
      const entityTypePath = metadata.entityType.toLowerCase().replace('_', '-');
      const entityId = metadata.entityId || 'general';
      const filePath = `${entityTypePath}/${entityId}/${fileName}`;
      
      // Check if file is actually a File object
      if (!(file instanceof File)) {
        throw new Error('Invalid file object provided');
      }
      
      // Determine the proper content type based on file extension if needed
      let contentType = file.type;
      if (!contentType || contentType === 'application/octet-stream') {
        // Map common extensions to MIME types
        const mimeMap: Record<string, string> = {
          'pdf': 'application/pdf',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'xls': 'application/vnd.ms-excel',
          'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'gif': 'image/gif',
          'txt': 'text/plain'
        };
        
        if (fileExt && mimeMap[fileExt.toLowerCase()]) {
          contentType = mimeMap[fileExt.toLowerCase()];
        }
      }
      
      // Create file options with proper headers to preserve content type
      const fileOptions = {
        contentType: contentType,
        cacheControl: '3600',
        upsert: true
      };
      
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('construction_documents')
        .upload(filePath, file, fileOptions);
        
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('construction_documents')
        .getPublicUrl(filePath);
        
      // Insert document metadata to Supabase
      const documentData = {
        file_name: file.name,
        file_type: contentType,
        file_size: file.size,
        storage_path: filePath,
        entity_type: metadata.entityType,
        entity_id: metadata.entityId,
        tags: metadata.tags || [],
        // Additional metadata fields
        category: metadata.category,
        amount: metadata.amount || null,
        expense_date: metadata.expenseDate ? metadata.expenseDate.toISOString() : null,
        version: metadata.version || 1,
        is_expense: metadata.isExpense || false,
        notes: metadata.notes || null,
        vendor_id: metadata.vendorId || null,
        vendor_type: metadata.vendorType || null,
        expense_type: metadata.expenseType || null,
      };
      
      // Insert metadata to documents table
      const { data: insertedData, error: insertError } = await supabase
        .from('documents')
        .insert(documentData)
        .select('document_id')
        .single();
        
      if (insertError) {
        console.error('Document metadata insert error:', insertError);
        throw insertError;
      }
      
      return {
        success: true,
        documentId: insertedData.document_id
      };
      
    } catch (error: any) {
      console.error('Upload error:', error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }
};
