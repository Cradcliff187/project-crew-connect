
import { supabase } from '@/integrations/supabase/client';
import { useVendorAssociationService } from './useVendorAssociationService';
import { ReceiptMetadata } from '@/types/timeTracking';

export function useReceiptUploadService() {
  const { createVendorAssociation } = useVendorAssociationService();

  const uploadReceipts = async (
    timeEntryId: string,
    entityType: 'work_order' | 'project',
    entityId: string,
    files: File[],
    metadata: ReceiptMetadata
  ) => {
    const uploadedDocuments = [];

    for (const file of files) {
      try {
        // Create a unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `receipts/time_entries/${timeEntryId}/${fileName}`;
        
        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('construction_documents')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        const mimeType = file.type || `application/${fileExt}`;
        
        // Create document record with enhanced metadata
        const documentMetadataObj = {
          file_name: file.name,
          file_type: file.type,
          mime_type: mimeType,
          file_size: file.size,
          storage_path: filePath,
          entity_type: 'TIME_ENTRY',
          entity_id: timeEntryId,
          category: metadata.category || 'receipt',
          is_expense: true,
          uploaded_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: metadata.tags || ['receipt', 'time-entry'],
          expense_type: metadata.expenseType || 'other',
          vendor_id: metadata.vendorId || null,
          amount: metadata.amount || null
        };
        
        const { data: insertedDoc, error: documentError } = await supabase
          .from('documents')
          .insert(documentMetadataObj)
          .select('document_id')
          .single();
          
        if (documentError) throw documentError;
        
        // Link document to time entry
        const { error: linkError } = await supabase
          .rpc('attach_document_to_time_entry', {
            p_time_entry_id: timeEntryId,
            p_document_id: insertedDoc.document_id
          });
          
        if (linkError) {
          console.error('Error linking document to time entry:', linkError);
        }
        
        // Create expense entries for the receipt
        const { error: expenseError } = await supabase
          .from('expenses')
          .insert({
            entity_type: entityType.toUpperCase(),
            entity_id: entityId,
            description: `Time entry receipt: ${file.name}`,
            expense_type: metadata.expenseType || 'TIME_RECEIPT',
            amount: metadata.amount || 0,
            document_id: insertedDoc.document_id,
            time_entry_id: timeEntryId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            quantity: 1,
            unit_price: metadata.amount || 0,
            expense_date: new Date().toISOString(),
            vendor_id: metadata.vendorId || null
          });
          
        if (expenseError) {
          console.error('Error creating expense for receipt:', expenseError);
        }
        
        // If there's a vendor, create or update vendor association
        if (metadata.vendorId) {
          await createVendorAssociation(
            metadata.vendorId,
            entityType.toUpperCase(),
            entityId,
            insertedDoc.document_id,
            {
              expenseType: metadata.expenseType,
              amount: metadata.amount
            }
          );
        }
        
        uploadedDocuments.push(insertedDoc);
      } catch (error) {
        console.error('Error processing receipt upload:', error);
      }
    }
    
    return uploadedDocuments;
  };

  return {
    uploadReceipts
  };
}
