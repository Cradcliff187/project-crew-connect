
import { supabase } from '@/integrations/supabase/client';
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

// Get construction documents bucket name (case-insensitive)
const getConstructionBucketName = async (): Promise<string> => {
  const { data: buckets } = await supabase.storage.listBuckets();
  
  // Default fallback name
  const defaultBucketName = 'construction_documents';
  
  if (!buckets || buckets.length === 0) {
    console.warn('No buckets found, using default name:', defaultBucketName);
    return defaultBucketName;
  }
  
  // Find the construction documents bucket with case-insensitive comparison
  const constructionBucket = buckets.find(bucket => 
    bucket.name.toLowerCase().includes('construction') &&
    bucket.name.toLowerCase().includes('document')
  );
  
  if (!constructionBucket) {
    console.warn('Construction documents bucket not found, using default name:', defaultBucketName);
    return defaultBucketName;
  }
  
  console.log('Using bucket with exact name:', constructionBucket.name);
  return constructionBucket.name;
};

export const uploadDocument = async (
  data: DocumentUploadFormValues
): Promise<UploadResult> => {
  try {
    console.log('Uploading document with data:', data);
    
    let uploadedDocumentId: string | undefined;
    
    const { files, metadata } = data;
    
    // Get the exact bucket name first to avoid case sensitivity issues
    const bucketName = await getConstructionBucketName();
    console.log(`Using storage bucket: "${bucketName}"`);
    
    // We'll handle multiple files if they're provided
    for (const file of files) {
      // Create a unique file name using timestamp and original name
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      
      // Format entity type for path to ensure consistency
      const entityTypePath = metadata.entityType.toLowerCase().replace(/_/g, '-');
      const entityId = metadata.entityId || 'general'; // Ensuring entityId always has a value
      const filePath = `${entityTypePath}/${entityId}/${fileName}`;
      
      console.log(`Uploading file to storage bucket, path: ${filePath}`);
      console.log(`File object:`, { 
        name: file.name, 
        type: file.type, 
        size: file.size 
      });
      
      // Check if file is actually a File object
      if (!(file instanceof File)) {
        console.error('Not a valid File object:', file);
        throw new Error('Invalid file object provided');
      }
      
      // Enhanced logging for Content-Type debugging
      console.log('File MIME type from browser:', file.type);
      
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
      
      // Enhanced debugging for upload
      console.log('About to execute upload with params:', {
        bucket: bucketName,
        path: filePath,
        fileType: contentType,
        fileSize: file.size,
        options: fileOptions
      });
      
      // Upload the file to Supabase Storage with explicit content type and exact bucket name
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from(bucketName)
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
      
      console.log('File uploaded successfully:', uploadData);
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
        
      console.log('Public URL generated:', publicUrl);
      
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
      
      console.log('Inserting document metadata:', documentData);
      
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
      stack: error.stack
    });
    
    return {
      success: false,
      error
    };
  }
};
