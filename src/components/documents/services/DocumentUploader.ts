import { supabase, DOCUMENTS_BUCKET_ID } from '@/integrations/supabase/client';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

export interface UploadResult {
  success: boolean;
  documentId?: string;
  error?: any;
}

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
    
    if (!data.files || data.files.length === 0) {
      console.error('No files provided for upload');
      throw new Error('No files provided for upload');
    }
    
    if (!data.metadata) {
      console.error('No metadata provided for upload');
      throw new Error('No metadata provided for upload');
    }
    
    let uploadedDocumentId: string | undefined;
    
    const { files, metadata } = data;
    
    for (const file of files) {
      if (!(file instanceof File)) {
        console.error('Not a valid File object:', file);
        throw new Error('Invalid file object provided');
      }
      
      console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
      
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      
      const entityTypePath = metadata.entityType.toLowerCase().replace(/_/g, '-');
      const entityId = metadata.entityId || 'general';
      const filePath = `${entityTypePath}/${entityId}/${fileName}`;
      
      console.log(`Uploading file directly to ${DOCUMENTS_BUCKET_ID}/${filePath}`);
      
      let contentType = file.type;
      if (!contentType || contentType === 'application/octet-stream') {
        contentType = getMimeTypeFromExtension(fileExt);
        console.log(`File type not provided, using extension-based type: ${contentType}`);
      }
      
      const fileOptions = {
        contentType: contentType,
        cacheControl: '3600',
        upsert: true,
        duplex: 'half' as const
      };
      
      console.log(`Starting upload to Supabase storage with options:`, fileOptions);
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .upload(filePath, file, fileOptions);
        
      if (uploadError) {
        console.error('Storage upload error:', {
          message: uploadError.message,
          name: uploadError.name,
          code: uploadError.code,
        });
        throw uploadError;
      }
      
      console.log('File uploaded successfully:', uploadData);
      
      const { data: { publicUrl } } = supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .getPublicUrl(filePath);
        
      console.log('Public URL generated:', publicUrl);
      
      const documentData = {
        file_name: file.name,
        file_type: contentType,
        file_size: file.size,
        storage_path: filePath,
        entity_type: metadata.entityType,
        entity_id: entityId,
        tags: metadata.tags || [],
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
      
      if (insertedData) {
        uploadedDocumentId = insertedData.document_id;
      }
    }
    
    return {
      success: true,
      documentId: uploadedDocumentId
    };
    
  } catch (error: any) {
    console.error('Upload error (detailed):', {
      errorMessage: error.message,
      errorObject: error,
      name: error.name,
      stack: error.stack,
      code: error.code || 'UNKNOWN_ERROR',
    });
    
    return {
      success: false,
      error
    };
  }
};
