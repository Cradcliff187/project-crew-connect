
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a receipt file and creates the necessary records in the database
 */
export const uploadReceiptFile = async (
  file: File,
  timeEntryId: string,
  metadata: {
    vendorId?: string;
    amount?: number;
    expenseType?: string;
    notes?: string;
  }
) => {
  try {
    // Upload to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `time_entries/${timeEntryId}/${fileName}`;
    
    console.log(`Uploading receipt file to path: ${filePath}`);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('construction_documents')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error('Error uploading receipt file:', uploadError);
      throw uploadError;
    }
    
    // Create document record with proper schema fields
    const documentData: any = {
      entity_type: 'TIME_ENTRY',
      entity_id: timeEntryId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: filePath,
      category: 'receipt',
      is_expense: true,
      tags: ['time-entry', 'receipt'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      vendor_id: metadata.vendorId,
      amount: metadata.amount,
      expense_type: metadata.expenseType,
      notes: metadata.notes
    };
    
    // Insert document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert(documentData)
      .select('document_id')
      .single();
      
    if (docError) {
      console.error('Error creating document record:', docError);
      throw docError;
    }
    
    // Create link between time entry and document
    if (document?.document_id) {
      const linkData = {
        time_entry_id: timeEntryId,
        document_id: document.document_id
      };
      
      const { error: linkError } = await supabase
        .from('time_entry_document_links')
        .insert(linkData);
        
      if (linkError) {
        console.error('Error creating document link:', linkError);
        throw linkError;
      }
      
      // Update time entry has_receipts flag
      await supabase
        .from('time_entries')
        .update({ has_receipts: true })
        .eq('id', timeEntryId);
        
      // Create expense record if amount is provided
      if (metadata.amount) {
        const expenseData = {
          entity_type: 'TIME_ENTRY',
          entity_id: timeEntryId,
          description: `Receipt: ${file.name}`,
          expense_type: metadata.expenseType || 'OTHER',
          amount: metadata.amount,
          vendor_id: metadata.vendorId,
          document_id: document.document_id,
          time_entry_id: timeEntryId,
          is_receipt: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          quantity: 1,
          unit_price: metadata.amount
        };
        
        const { error: expenseError } = await supabase
          .from('expenses')
          .insert(expenseData);
          
        if (expenseError) {
          console.error('Error creating expense record:', expenseError);
          // Don't throw here, as the document is already created
        }
      }
      
      return document.document_id;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error in uploadReceiptFile:', error);
    toast({
      title: "Receipt upload failed",
      description: error.message || "Failed to upload receipt file",
      variant: "destructive"
    });
    throw error;
  }
};

/**
 * Delete a receipt and all associated records
 */
export const deleteReceipt = async (timeEntryId: string, documentId: string): Promise<boolean> => {
  if (!timeEntryId || !documentId) return false;
  
  try {
    console.log(`Deleting receipt: document ID ${documentId}, time entry ID ${timeEntryId}`);
    
    // First get the document details to delete the file from storage
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('storage_path')
      .eq('document_id', documentId)
      .single();
      
    if (docError) {
      console.error('Error fetching document details:', docError);
      throw docError;
    }
    
    // Remove the link between time entry and document
    const { error: unlinkError } = await supabase
      .from('time_entry_document_links')
      .delete()
      .eq('time_entry_id', timeEntryId)
      .eq('document_id', documentId);
      
    if (unlinkError) {
      console.error('Error removing document link:', unlinkError);
      throw unlinkError;
    }
    
    // Delete any expense records associated with this document
    const { error: expenseError } = await supabase
      .from('expenses')
      .delete()
      .eq('document_id', documentId);
      
    if (expenseError) {
      console.error('Error deleting expense record:', expenseError);
      // Continue even if expense deletion fails
    }
    
    // Delete the document record
    const { error: deleteDocError } = await supabase
      .from('documents')
      .delete()
      .eq('document_id', documentId);
      
    if (deleteDocError) {
      console.error('Error deleting document record:', deleteDocError);
      throw deleteDocError;
    }
    
    // Delete the file from storage
    if (document?.storage_path) {
      const { error: storageError } = await supabase
        .storage
        .from('construction_documents')
        .remove([document.storage_path]);
        
      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue even if storage removal fails - the document is already unlinked
      }
    }
    
    // Check if the time entry has other receipts
    const { data: remainingLinks, error: countError } = await supabase
      .from('time_entry_document_links')
      .select('document_id')
      .eq('time_entry_id', timeEntryId);
      
    if (countError) {
      console.error('Error checking remaining links:', countError);
      throw countError;
    }
    
    // Update the time_entry has_receipts flag based on remaining receipts
    const { error: updateError } = await supabase
      .from('time_entries')
      .update({ has_receipts: (remainingLinks || []).length > 0 })
      .eq('id', timeEntryId);
      
    if (updateError) {
      console.error('Error updating time entry:', updateError);
      throw updateError;
    }
    
    toast({
      title: 'Receipt deleted',
      description: 'The receipt has been successfully deleted.',
    });
    
    return true;
  } catch (err: any) {
    console.error('Error deleting receipt:', err);
    
    toast({
      title: 'Error deleting receipt',
      description: err.message || 'There was an error deleting the receipt.',
      variant: 'destructive',
    });
    
    return false;
  }
};

/**
 * Fetches receipts for a time entry
 */
export const fetchTimeEntryReceipts = async (timeEntryId: string) => {
  if (!timeEntryId) return [];
  
  try {
    console.log(`Fetching receipts for time entry ID: ${timeEntryId}`);
    
    // First get the document IDs linked to this time entry
    const { data: links, error: linksError } = await supabase
      .from('time_entry_document_links')
      .select('document_id')
      .eq('time_entry_id', timeEntryId);
      
    if (linksError) {
      console.error('Error fetching document links:', linksError);
      throw linksError;
    }
    
    console.log(`Found ${links?.length || 0} document links`);
    
    if (!links || links.length === 0) {
      return [];
    }
    
    // Get the document details for each ID
    const documentIds = links.map(link => link.document_id);
    
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .in('document_id', documentIds);
      
    if (documentsError) {
      console.error('Error fetching documents:', documentsError);
      throw documentsError;
    }
    
    console.log(`Retrieved ${documents?.length || 0} document records`);
    
    if (!documents || documents.length === 0) {
      return [];
    }
    
    // Generate signed URLs for each document
    const receiptsWithUrls = await Promise.all(documents.map(async (doc) => {
      try {
        const { data, error: urlError } = await supabase
          .storage
          .from('construction_documents')
          .createSignedUrl(doc.storage_path, 60 * 60); // 1 hour expiry
          
        if (urlError) {
          console.error('Error creating signed URL:', urlError);
          return {
            ...doc,
            url: ''
          };
        }
        
        return {
          ...doc,
          url: data?.signedUrl || ''
        };
      } catch (e) {
        console.error('Error generating URL for document:', e);
        return {
          ...doc,
          url: ''
        };
      }
    }));
    
    return receiptsWithUrls;
  } catch (err: any) {
    console.error('Error fetching receipts:', err);
    toast({
      title: 'Error loading receipts',
      description: err.message || 'Failed to load receipts',
      variant: 'destructive'
    });
    return [];
  }
};
