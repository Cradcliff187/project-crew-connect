
import { supabase } from '@/integrations/supabase/client';
import { DocumentUploadMetadata, DocumentCategory, EntityType } from '@/components/documents/schemas/documentSchema';
import { toast } from '@/hooks/use-toast';

// Function to upload a document to Supabase storage and create a document record
export const uploadDocument = async (file: File, metadata: DocumentUploadMetadata) => {
  try {
    // Create a unique file name based on timestamp and original name
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 10);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    
    // Create storage path based on entity type and ID
    const entityTypePath = metadata.entityType.toLowerCase().replace('_', '-');
    const entityIdPath = metadata.entityId || 'general';
    const filePath = `${entityTypePath}/${entityIdPath}/${fileName}`;
    
    // Upload file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('construction_documents')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: 'Error uploading file: ' + uploadError.message };
    }
    
    // Format expense date correctly
    const expenseDate = metadata.expenseDate 
      ? (metadata.expenseDate instanceof Date 
          ? metadata.expenseDate.toISOString() 
          : metadata.expenseDate)
      : null;
    
    // Prepare document data for database
    const docData = {
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: filePath,
      entity_type: metadata.entityType,
      entity_id: metadata.entityId,
      category: metadata.category,
      amount: metadata.amount,
      expense_date: expenseDate,
      version: metadata.version || 1,
      tags: metadata.tags || [],
      notes: metadata.notes,
      is_expense: metadata.isExpense,
      vendor_id: metadata.vendorId,
      vendor_type: metadata.vendorType,
      expense_type: metadata.expenseType,
      budget_item_id: metadata.budgetItemId
    };
    
    // Insert document record into database
    const { data: insertedDoc, error: documentError } = await supabase
      .from('documents')
      .insert(docData)
      .select()
      .single();
    
    if (documentError) {
      console.error('Document insert error:', documentError);
      // Try to delete the uploaded file if database insert fails
      await supabase.storage
        .from('construction_documents')
        .remove([filePath]);
        
      return { success: false, error: 'Error creating document record: ' + documentError.message };
    }
    
    // Get the document ID from the inserted record
    const documentId = insertedDoc.document_id;
    
    // If there's a parent entity relationship, create it
    if (metadata.parentEntityType && metadata.parentEntityId) {
      const relationData = {
        source_document_id: documentId,
        target_document_id: null,
        relationship_type: 'PARENT_ENTITY',
        relationship_metadata: {
          parent_entity_type: metadata.parentEntityType,
          parent_entity_id: metadata.parentEntityId
        }
      };
      
      // Insert relationship record
      const { error: relationError } = await supabase
        .from('document_relationships')
        .insert(relationData);
      
      if (relationError) {
        console.error('Relationship insert error:', relationError);
        // We continue even if relationship creation fails
      }
    }
    
    // Show success toast with feedback
    toast({
      title: "Upload successful",
      description: `${file.name} has been uploaded successfully.`
    });
    
    return { 
      success: true, 
      documentId,
      document: insertedDoc 
    };
  } catch (error: any) {
    console.error('Document upload error:', error);
    return { 
      success: false, 
      error: error.message || 'An unexpected error occurred during upload' 
    };
  }
};

// Function to download a document from Supabase storage
export const downloadDocument = async (documentId: string) => {
  try {
    // Get document details
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('storage_path, file_name')
      .eq('document_id', documentId)
      .single();
    
    if (docError || !document) {
      console.error('Document fetch error:', docError);
      return { success: false, error: 'Document not found' };
    }
    
    // Get download URL from Supabase storage
    const { data, error } = await supabase.storage
      .from('construction_documents')
      .download(document.storage_path);
    
    if (error) {
      console.error('Download error:', error);
      return { success: false, error: 'Error downloading file: ' + error.message };
    }
    
    // Create a blob URL for the downloaded data
    const url = URL.createObjectURL(data);
    
    // Create a temporary anchor element to trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = document.file_name;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    return { success: true };
  } catch (error: any) {
    console.error('Document download error:', error);
    return { 
      success: false, 
      error: error.message || 'An unexpected error occurred during download' 
    };
  }
};
