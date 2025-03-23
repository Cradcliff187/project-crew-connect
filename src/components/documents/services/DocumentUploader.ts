
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
    console.log('Uploading document with data:', data);
    
    let uploadedDocumentId: string | undefined;
    
    const { files, metadata } = data;
    
    // We'll handle multiple files if they're provided
    for (const file of files) {
      // Create a unique file name using timestamp and original name
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      
      // CRITICAL FIX: Ensure proper path format
      // In Supabase, folder paths should use lowercase entity types and have proper structure
      const entityTypePath = metadata.entityType.toLowerCase().replace('_', '-');
      const filePath = `${entityTypePath}/${metadata.entityId || 'general'}/${fileName}`;
      
      console.log(`Uploading file to construction_documents bucket, path: ${filePath}`);
      console.log(`File object:`, file);
      
      // Check if file is actually a File object
      if (!(file instanceof File)) {
        console.error('Not a valid File object:', file);
        throw new Error('Invalid file object provided');
      }
      
      // CRITICAL FIX: Use explicit file handling to ensure proper binary upload
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('construction_documents')
        .upload(filePath, file, {
          contentType: file.type, // Set the correct content type
          upsert: true // Override existing files with same name if needed
        });
        
      if (uploadError) {
        console.error('Storage upload error:', {
          message: uploadError.message,
          error: uploadError,
          // Use safely typed properties
          status: uploadError.status,
          name: uploadError.name,
          cause: uploadError.cause
        });
        throw uploadError;
      }
      
      console.log('File uploaded successfully:', uploadData);
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('construction_documents')
        .getPublicUrl(filePath);
        
      console.log('Public URL generated:', publicUrl);
      
      // Now insert document metadata to Supabase
      const documentData = {
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: filePath,
        entity_type: metadata.entityType,
        entity_id: metadata.entityId || null,
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
        console.error('Document metadata insert error:', insertError);
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
      // Only include properties that definitely exist
      name: error.name,
      stack: error.stack,
      cause: error.cause,
      // For Supabase errors
      status: error.status,
      additionalInfo: error.details || 'No additional details'
    });
    
    return {
      success: false,
      error
    };
  }
};
