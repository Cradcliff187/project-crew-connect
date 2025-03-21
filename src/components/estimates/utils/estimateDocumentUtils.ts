
import { supabase } from '@/integrations/supabase/client';

/**
 * Uploads a document for an estimate item and returns the document ID
 */
export const uploadItemDocument = async (
  file: File, 
  estimateId: string, 
  itemIndex: number,
  itemData?: {
    item_type?: string;
    vendor_id?: string;
    subcontractor_id?: string;
  }
): Promise<string | null> => {
  try {
    // Create a unique file path
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-item-${itemIndex}.${fileExt}`;
    const filePath = `estimates/${estimateId}/items/${fileName}`;
    
    console.log(`Uploading file for estimate ${estimateId}, item ${itemIndex}: ${fileName}`);
    console.log(`File type: ${file.type}, size: ${file.size} bytes`);
    
    const BUCKET_NAME = 'construction_documents';
    
    // Check if the bucket exists
    const { data: bucketExists, error: bucketCheckError } = await supabase.storage.getBucket(BUCKET_NAME);
    
    if (bucketCheckError && bucketCheckError.message.includes('does not exist')) {
      console.log(`Creating bucket ${BUCKET_NAME}`);
      const { error: createBucketError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 52428800  // 50MB
      });
      
      if (createBucketError) {
        console.error('Error creating storage bucket:', createBucketError);
        return null;
      }
    } else if (bucketCheckError) {
      console.error('Error checking bucket:', bucketCheckError);
      return null;
    }

    // Prepare file data using FormData to ensure correct content type
    const formData = new FormData();
    formData.append('file', file, file.name);
    
    // Get correct upload URL
    const { data: uploadUrl } = supabase.storage.from(BUCKET_NAME).getUploadUrl(filePath);
    console.log('Upload URL:', uploadUrl);
    
    // Create a clean copy of the file with explicit blob
    const fileBlob = file.slice(0, file.size, file.type);
    
    // Upload using fetch with explicit headers
    const uploadResponse = await fetch(
      `${supabase.storageUrl}/object/${BUCKET_NAME}/${filePath}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          // No Content-Type header here, let the browser set it with the file boundary
        },
        body: fileBlob
      }
    );
    
    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      console.error('Error uploading document:', errorData);
      return null;
    }
    
    console.log('File upload successful');
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
      
    console.log('File public URL:', publicUrl);
    
    // Determine the appropriate category based on item type
    let category = 'estimate';
    if (file.name.toLowerCase().includes('invoice') || file.name.toLowerCase().includes('receipt')) {
      category = 'invoice';
    } else if (file.name.toLowerCase().includes('quote') || file.name.toLowerCase().includes('proposal')) {
      category = itemData?.item_type === 'vendor' ? 'vendor_quote' : 'subcontractor_estimate';
    } else if (itemData?.item_type === 'vendor') {
      category = 'vendor_quote';
    } else if (itemData?.item_type === 'subcontractor') {
      category = 'subcontractor_estimate';
    }
    
    // Prepare tags array with the basic information
    const tags = ['estimate_item', `item_${itemIndex}`];
    
    // Add item type to tags if available
    if (itemData?.item_type) {
      tags.push(itemData.item_type);
    }
    
    // Store document metadata in documents table
    const documentMetadata = {
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: filePath,
      entity_type: 'ESTIMATE',
      entity_id: estimateId,
      category: category,
      tags: tags,
      // Add vendor or subcontractor relationship if available
      vendor_id: itemData?.item_type === 'vendor' 
        ? itemData.vendor_id 
        : (itemData?.item_type === 'subcontractor' ? itemData.subcontractor_id : null),
      vendor_type: itemData?.item_type || null
    };
    
    console.log('Inserting document metadata:', documentMetadata);
    
    // Insert document metadata and get the document ID
    const { data: insertedDoc, error: documentError } = await supabase
      .from('documents')
      .insert(documentMetadata)
      .select('document_id')
      .single();
      
    if (documentError) {
      console.error('Error storing document metadata:', documentError);
      return null;
    }
    
    console.log('Document uploaded successfully with ID:', insertedDoc?.document_id);
    return insertedDoc?.document_id || null;
  } catch (error) {
    console.error('Error in document upload:', error);
    return null;
  }
};

/**
 * Updates document entity_id when an estimate is created
 */
export const updateDocumentEntityId = async (documentId: string | undefined, estimateId: string): Promise<boolean> => {
  if (!documentId) return false;
  
  try {
    console.log(`Updating document ${documentId} to link with estimate ${estimateId}`);
    
    const { error } = await supabase
      .from('documents')
      .update({ entity_id: estimateId })
      .eq('document_id', documentId);
      
    if (error) {
      console.error('Error updating document entity_id:', error);
      return false;
    }
    
    console.log(`Document ${documentId} successfully linked to estimate ${estimateId}`);
    return true;
  } catch (error) {
    console.error('Error in update document entity_id:', error);
    return false;
  }
};

/**
 * Get all documents associated with an estimate
 */
export const getEstimateDocuments = async (estimateId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('entity_type', 'ESTIMATE')
      .eq('entity_id', estimateId);

    if (error) {
      console.error('Error fetching estimate documents:', error);
      return [];
    }

    // Add URLs to the documents
    const docsWithUrls = await Promise.all((data || []).map(async (doc) => {
      const { data: { publicUrl } } = supabase.storage
        .from('construction_documents')
        .getPublicUrl(doc.storage_path);
      
      return { ...doc, url: publicUrl };
    }));

    return docsWithUrls || [];
  } catch (error) {
    console.error('Error in getEstimateDocuments:', error);
    return [];
  }
};
