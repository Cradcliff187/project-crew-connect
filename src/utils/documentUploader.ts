import { supabase } from '@/integrations/supabase/client';
import { DocumentMetadata, DocumentCategory } from '@/components/documents/schemas/documentSchema';
import { toast } from '@/hooks/use-toast';

// Function to upload a document to Supabase storage and create a document record
export const uploadDocument = async (file: File, metadata: DocumentMetadata) => {
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

    // Prepare document data for database
    const docData = {
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: filePath,
      entity_type: metadata.entityType,
      entity_id: metadata.entityId,
      category: metadata.category as DocumentCategory,
      amount: metadata.amount,
      expense_date: metadata.expenseDate ? metadata.expenseDate.toISOString() : null,
      version: metadata.version || 1,
      tags: metadata.tags || [],
      notes: metadata.notes,
      is_expense: metadata.isExpense,
      vendor_id: metadata.vendorId,
      vendor_type: metadata.vendorType,
      expense_type: metadata.expenseType,
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
      await supabase.storage.from('construction_documents').remove([filePath]);

      return { success: false, error: 'Error creating document record: ' + documentError.message };
    }

    // Show success toast with feedback
    toast({
      title: 'Upload successful',
      description: `${file.name} has been uploaded successfully.`,
      variant: 'default',
    });

    return {
      success: true,
      documentId: insertedDoc.document_id,
      document: insertedDoc,
    };
  } catch (error: any) {
    console.error('Upload document error:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
};

// Function to upload multiple documents
export const uploadMultipleDocuments = async (files: File[], metadata: DocumentMetadata) => {
  try {
    const results = [];

    for (const file of files) {
      const result = await uploadDocument(file, metadata);
      results.push(result);
    }

    const successCount = results.filter(r => r.success).length;

    // Show appropriate toast message
    if (successCount === files.length) {
      toast({
        title: 'All uploads successful',
        description: `${successCount} document${successCount !== 1 ? 's' : ''} uploaded successfully.`,
      });
    } else if (successCount > 0) {
      toast({
        title: 'Some uploads failed',
        description: `${successCount} of ${files.length} documents uploaded successfully.`,
        variant: 'default',
      });
    } else {
      toast({
        title: 'Upload failed',
        description: 'All document uploads failed.',
        variant: 'destructive',
      });
    }

    return {
      success: successCount > 0,
      totalCount: files.length,
      successCount,
      results,
    };
  } catch (error: any) {
    console.error('Multiple upload error:', error);
    return {
      success: false,
      error: error.message,
      totalCount: files.length,
      successCount: 0,
      results: [],
    };
  }
};
