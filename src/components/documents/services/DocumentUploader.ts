
import { supabase, DOCUMENTS_BUCKET_ID } from '@/integrations/supabase/client';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

export interface UploadResult {
  success: boolean;
  documentId?: string;
  error?: any;
}

// Helper function to determine MIME type from file extension
const getMimeTypeFromExtension = (fileExt: string): string => {
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
  
  return mimeMap[fileExt.toLowerCase()] || 'application/octet-stream';
};

export const uploadDocument = async (
  data: DocumentUploadFormValues
): Promise<UploadResult> => {
  try {
    console.log('Uploading document with data:', data);
    
    // Validate that files are present
    if (!data.files || data.files.length === 0) {
      console.error('No files provided for upload');
      throw new Error('No files provided for upload');
    }
    
    // Validate that metadata is present
    if (!data.metadata) {
      console.error('No metadata provided for upload');
      throw new Error('No metadata provided for upload');
    }
    
    let uploadedDocumentId: string | undefined;
    
    const { files, metadata } = data;
    
    // We'll handle multiple files if they're provided
    for (const file of files) {
      // Validate the file object
      if (!(file instanceof File)) {
        console.error('Not a valid File object:', file);
        throw new Error('Invalid file object provided');
      }
      
      console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
      
      // Create a unique file name using timestamp and original name
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      
      // Format entity type for path to ensure consistency
      const entityTypePath = metadata.entityType.toLowerCase().replace(/_/g, '-');
      const entityId = metadata.entityId || 'general'; // Ensuring entityId always has a value
      const filePath = `${entityTypePath}/${entityId}/${fileName}`;
      
      console.log(`Uploading file directly to ${DOCUMENTS_BUCKET_ID}/${filePath}`);
      
      // Determine the proper content type based on file extension if needed
      let contentType = file.type;
      if (!contentType || contentType === 'application/octet-stream') {
        contentType = getMimeTypeFromExtension(fileExt);
        console.log(`File type not provided, using extension-based type: ${contentType}`);
      }
      
      // Create file options with proper headers to preserve content type
      const fileOptions = {
        contentType: contentType,
        cacheControl: '3600',
        upsert: true,
        duplex: 'half' as const
      };
      
      // Use the constant bucket ID directly
      console.log(`Starting upload to Supabase storage with options:`, fileOptions);
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .upload(filePath, file, fileOptions);
        
      if (uploadError) {
        console.error('Storage upload error:', {
          message: uploadError.message,
          error: uploadError,
          name: uploadError.name,
          stack: uploadError.stack,
          status: uploadError.status,
          details: uploadError.details
        });
        throw uploadError;
      }
      
      console.log('File uploaded successfully:', uploadData);
      
      // Get public URL for the uploaded file 
      const { data: { publicUrl } } = supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .getPublicUrl(filePath);
        
      console.log('Public URL generated:', publicUrl);
      
      // Now insert document metadata to Supabase
      const documentData = {
        file_name: file.name,
        file_type: contentType,
        file_size: file.size,
        storage_path: filePath,
        entity_type: metadata.entityType,
        entity_id: entityId,
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
      
      console.log('Inserting document metadata:', documentData);
      
      const { data: insertedData, error: insertError } = await supabase
        .from('documents')
        .insert(documentData)
        .select('document_id')
        .single();
        
      if (insertError) {
        console.error('Document metadata insert error:', {
          message: insertError.message,
          error: insertError,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        });
        throw insertError;
      }
      
      console.log('Document metadata inserted:', insertedData);
      
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
    // Enhanced error logging
    console.error('Upload error (detailed):', {
      errorMessage: error.message,
      errorObject: error,
      name: error.name,
      stack: error.stack,
      code: error.code,
      details: error.details || 'No additional details',
      status: error.status || 'No status code'
    });
    
    return {
      success: false,
      error
    };
  }
};
