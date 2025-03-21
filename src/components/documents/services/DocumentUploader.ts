
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
    const BUCKET_NAME = 'construction_documents';
    
    // First, check if the bucket exists
    const { data: bucketData, error: bucketCheckError } = await supabase.storage.getBucket(BUCKET_NAME);
    
    if (bucketCheckError && bucketCheckError.message.includes('does not exist')) {
      console.log(`Creating bucket ${BUCKET_NAME}`);
      const { error: createBucketError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 52428800  // 50MB
      });
      
      if (createBucketError) {
        console.error('Error creating storage bucket:', createBucketError);
        throw new Error('Unable to create storage bucket. Please contact the administrator.');
      }
    } else if (bucketCheckError) {
      console.error('Error checking bucket:', bucketCheckError);
      throw new Error('Unable to access storage buckets. Please check your permissions.');
    }
    
    // We'll handle multiple files if they're provided
    for (const file of files) {
      // Create a unique file name using timestamp and original name
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${metadata.entityType.toLowerCase()}/${metadata.entityId || 'general'}/${fileName}`;
      
      console.log(`Uploading file to ${BUCKET_NAME} bucket, path: ${filePath}`);
      console.log(`File type: ${file.type}, size: ${file.size} bytes`);
      
      // Create a proper file blob with correct content type
      const fileBlob = new Blob([await file.arrayBuffer()], { type: file.type });
      
      // Upload the file using the Supabase storage API with explicit content type
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, fileBlob, {
          contentType: file.type,
          cacheControl: '3600'
        });
      
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`File upload failed: ${uploadError.message || 'Unknown error'}`);
      }
      
      console.log('File uploaded successfully');
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
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
    console.error('Upload error:', error);
    return {
      success: false,
      error
    };
  }
};
