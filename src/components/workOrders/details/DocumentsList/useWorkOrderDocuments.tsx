
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderDocument } from './types';

export const useWorkOrderDocuments = (workOrderId: string) => {
  const [documents, setDocuments] = useState<WorkOrderDocument[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      console.log('Fetching documents for work order:', workOrderId);
      
      // Fetch direct work order documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('document_id, file_name, category, created_at, file_type, storage_path')
        .eq('entity_id', workOrderId)
        .eq('entity_type', 'WORK_ORDER');
          
      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
        return;
      }
      
      // Fetch receipt documents linked to expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('document_id')
        .eq('entity_id', workOrderId)
        .eq('entity_type', 'WORK_ORDER')
        .not('document_id', 'is', null);
      
      if (expensesError) {
        console.error('Error fetching expense receipts:', expensesError);
        return;
      }
      
      // Fetch receipt documents linked to time entries
      const { data: timeEntriesData, error: timeEntriesError } = await supabase
        .from('time_entries')
        .select('id')
        .eq('entity_id', workOrderId)
        .eq('entity_type', 'work_order')
        .eq('has_receipts', true);
        
      if (timeEntriesError) {
        console.error('Error fetching time entries with receipts:', timeEntriesError);
        return;
      }
      
      let timeEntryReceiptDocumentIds: string[] = [];
      if (timeEntriesData && timeEntriesData.length > 0) {
        const timeEntryIds = timeEntriesData.map(entry => entry.id);
        
        const { data: timeEntryDocs, error: timeEntryDocsError } = await supabase
          .from('time_entry_document_links')
          .select('document_id')
          .in('time_entry_id', timeEntryIds);
          
        if (timeEntryDocsError) {
          console.error('Error fetching time entry document links:', timeEntryDocsError);
        } else {
          timeEntryReceiptDocumentIds = timeEntryDocs.map(doc => doc.document_id);
        }
      }
      
      // Extract document IDs from expenses and time entries
      const expenseDocumentIds = (expensesData || [])
        .map(expense => expense.document_id)
        .filter(Boolean);
      
      // Combine all document IDs
      const receiptDocumentIds = [...expenseDocumentIds, ...timeEntryReceiptDocumentIds].filter(Boolean);
      
      // If we have receipt documents, fetch them
      let receiptDocuments: any[] = [];
      if (receiptDocumentIds.length > 0) {
        console.log('Fetching receipt documents with IDs:', receiptDocumentIds);
        
        const { data: receiptsData, error: receiptsError } = await supabase
          .from('documents')
          .select('document_id, file_name, category, created_at, file_type, storage_path')
          .in('document_id', receiptDocumentIds);
        
        if (receiptsError) {
          console.error('Error fetching receipt documents:', receiptsError);
        } else {
          // Mark these as receipts for display purposes
          receiptDocuments = (receiptsData || []).map(doc => ({
            ...doc,
            is_receipt: true
          }));
        }
      }
      
      // Combine all documents
      const allDocuments = [...(documentsData || []), ...receiptDocuments];
      console.log('Combined documents before URL generation:', allDocuments);
      
      // Get signed URLs for documents for better security
      const enhancedDocuments = await Promise.all(
        allDocuments.map(async (doc) => {
          let url = '';
          if (doc.storage_path) {
            const options = {
              download: false,
              transform: {
                width: 800,
                height: 800,
                quality: 80
              }
            };
            
            const { data, error } = await supabase.storage
              .from('construction_documents') // Using the correct bucket name
              .createSignedUrl(doc.storage_path, 300, options); // 5 minutes expiration
              
            if (error) {
              console.error('Error generating signed URL for', doc.document_id, error);
            } else {
              url = data.signedUrl;
            }
          }
          
          return {
            ...doc,
            url,
            entity_id: workOrderId,
            entity_type: 'WORK_ORDER'
          };
        })
      );
      
      console.log('Fetched documents with URLs:', enhancedDocuments);
      setDocuments(enhancedDocuments);
    } catch (error) {
      console.error('Error processing documents:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDocuments();
  }, [workOrderId]);
  
  return { documents, loading, fetchDocuments };
};
