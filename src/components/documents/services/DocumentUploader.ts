
import { supabase } from '@/integrations/supabase/client';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

export interface UploadResult {
  success: boolean;
  documentId?: string;
  error?: any;
}

export const uploadDocument = async (
  data: DocumentUploadFormValues
): Promise<UploadResult> => {
  try {
    // Only log in development environment
    if (process.env.NODE_ENV === 'development') {
      console.log('Uploading document with data:', data);
    }
    
    let uploadedDocumentId: string | undefined;
    
    const { files, metadata } = data;
    
    // We'll handle multiple files if they're provided
    for (const file of files) {
      // Create a unique file name using timestamp and original name
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      
      // Format entity type for path to ensure consistency
      const entityTypePath = metadata.entityType.toLowerCase().replace('_', '-');
      const entityId = metadata.entityId || 'general'; // Ensuring entityId always has a value
      const filePath = `${entityTypePath}/${entityId}/${fileName}`;
      
      // Only log in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log(`Uploading file to construction_documents bucket, path: ${filePath}`);
      }
      
      // Check if file is actually a File object
      if (!(file instanceof File)) {
        console.error('Not a valid File object:', file);
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
          
          // Only log in development environment
          if (process.env.NODE_ENV === 'development') {
            console.log(`File type not provided, using extension-based type: ${contentType}`);
          }
        }
      }
      
      // Create file options with proper headers to preserve content type
      const fileOptions = {
        contentType: contentType,
        cacheControl: '3600',
        upsert: true,
        // Use explicit options for storage
        duplex: 'half' as const
      };
      
      // Upload the file to Supabase Storage with explicit content type
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('construction_documents')
        .upload(filePath, file, fileOptions);
        
      if (uploadError) {
        console.error('Storage upload error:', {
          message: uploadError.message,
          error: uploadError,
          name: uploadError.name,
          stack: uploadError.stack
        });
        throw uploadError;
      }
      
      // Only log in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log('File uploaded successfully:', uploadData);
      }
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('construction_documents')
        .getPublicUrl(filePath);
        
      // Only log in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log('Public URL generated:', publicUrl);
      }
      
      // Now insert document metadata to Supabase
      const documentData = {
        file_name: file.name,
        file_type: contentType, // Use our determined content type
        file_size: file.size,
        storage_path: filePath,
        entity_type: metadata.entityType,
        entity_id: entityId, // Use the sanitized entity ID
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
      
      // Only log in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log('Inserting document metadata:', documentData);
      }
      
      // For this DB call we need to ensure headers are correctly sent
      const { data: insertedData, error: insertError } = await supabase
        .from('documents')
        .insert(documentData)
        .select('document_id')
        .single();
        
      if (insertError) {
        console.error('Document metadata insert error:', {
          message: insertError.message,
          error: insertError
        });
        throw insertError;
      }
      
      // Only log in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log('Document metadata inserted:', insertedData);
      }
      
      // Store the document ID for the first file
      if (insertedData) {
        uploadedDocumentId = insertedData.document_id;
      }
    }
    
    return {
      success: true,
      documentId: uploadedDocumentId
    };
    
  } catch (error: any) {
    // Enhanced error logging, but only critical errors are always shown
    console.error('Upload error:', error.message);
    
    // More detailed error only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Upload error details:', {
        errorObject: error,
        name: error.name,
        stack: error.stack
      });
    }
    
    return {
      success: false,
      error
    };
  }
};
