import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Document, EntityType } from '@/components/documents/schemas/documentSchema';

/**
 * Upload a document to storage and create a record in the documents table
 * 
 * @param file The file to upload
 * @param entityType The type of entity the document is associated with
 * @param entityId The ID of the entity the document is associated with
 * @param options Additional options
 * @returns The created document record
 */
export const uploadDocument = async (
  file: File,
  entityType: EntityType,
  entityId: string,
  options: {
    category?: string;
    tags?: string[];
    notes?: string;
    isExpense?: boolean;
    amount?: number;
    expenseDate?: Date;
  } = {}
): Promise<Document | null> => {
  try {
    // Generate a unique ID for the document
    const documentId = uuidv4();
    
    // Generate a storage path with folder structure based on entity type and ID
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const filePath = `${entityType.toLowerCase()}/${entityId}/${documentId}_${timestamp}.${fileExt}`;
    
    // Upload the file to Supabase storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('construction_documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (storageError) {
      console.error('Error uploading file:', storageError);
      throw new Error(storageError.message);
    }
    
    // Prepare metadata for document record
    const documentMetadata = {
      document_id: documentId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: filePath,
      entity_type: entityType,
      entity_id: entityId,
      category: options.category || 'general',
      tags: options.tags || [],
      notes: options.notes || '',
      is_expense: options.isExpense || false,
      amount: options.amount || null,
      expense_date: options.expenseDate ? options.expenseDate.toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
      is_latest_version: true
    };
    
    // Insert document record into the database
    const { data: documentData, error: dbError } = await supabase
      .from('documents')
      .insert(documentMetadata)
      .select()
      .single();
    
    if (dbError) {
      console.error('Error creating document record:', dbError);
      // Clean up the uploaded file if database insert fails
      await supabase
        .storage
        .from('construction_documents')
        .remove([filePath]);
      throw new Error(dbError.message);
    }
    
    // Get the URL for the uploaded file
    const { data: publicUrlData } = await supabase
      .storage
      .from('construction_documents')
      .getPublicUrl(filePath);
    
    // Return the document with the URL
    const fullDocument: Document = {
      ...documentData as Document,
      url: publicUrlData.publicUrl,
      entity_type: documentData.entity_type as EntityType,
    };
    
    return fullDocument;
  } catch (error: any) {
    console.error('Document upload failed:', error);
    toast({
      title: 'Upload failed',
      description: error.message || 'Failed to upload document',
      variant: 'destructive'
    });
    return null;
  }
};

/**
 * Download a document
 * 
 * @param document The document to download
 */
export const downloadDocument = (document: { storage_path: string, file_name: string }) => {
  if (!document || !document.storage_path) {
    toast({
      title: 'Download failed',
      description: 'Invalid document data',
      variant: 'destructive'
    });
    return;
  }
  
  const downloadFile = async () => {
    try {
      const { data, error } = await supabase
        .storage
        .from('construction_documents')
        .download(document.storage_path);
      
      if (error) {
        throw error;
      }
      
      // Create a download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(data);
      link.download = document.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: 'Download failed',
        description: error.message || 'Failed to download the file',
        variant: 'destructive'
      });
    }
  };
  
  // Use global document object
  const a = document.createElement('a');
  // Check if we can get a public URL
  supabase
    .storage
    .from('construction_documents')
    .getPublicUrl(document.storage_path)
    .then(({ data }) => {
      if (data && data.publicUrl) {
        // If public URL is available, use it directly
        a.href = data.publicUrl;
        a.download = document.file_name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Otherwise fall back to download method
        downloadFile();
      }
    })
    .catch(() => {
      // If getting public URL fails, fall back to download method
      downloadFile();
    });
};
