
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
      const filePath = `${metadata.entityType.toLowerCase()}/${metadata.entityId || 'general'}/${fileName}`;
      
      // Using the correct bucket name
      const bucketName = 'construction_documents';
      
      console.log(`Uploading file to ${bucketName} bucket, path: ${filePath}`);
      
      // Upload file to Supabase Storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }
      
      console.log('File uploaded successfully:', uploadData);
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
        
      console.log('Public URL generated:', publicUrl);
      
      // Now insert document metadata to Supabase
      const { data: insertedData, error: insertError } = await supabase
        .from('documents')
        .insert({
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: filePath,
          entity_type: metadata.entityType,
          entity_id: metadata.entityId || null,
          tags: metadata.tags,
          // Additional metadata fields
          category: metadata.category,
          amount: metadata.amount,
          expense_date: metadata.expenseDate ? metadata.expenseDate.toISOString() : null,
          version: metadata.version,
          is_expense: metadata.isExpense,
          notes: metadata.notes,
          vendor_id: metadata.vendorId || null,
          vendor_type: metadata.vendorType || null,
        })
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
    
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error
    };
  }
};
