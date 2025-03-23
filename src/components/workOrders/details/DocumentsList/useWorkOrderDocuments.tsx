
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
      
      // Fetch receipt documents linked to work order materials
      const { data: materialsData, error: materialsError } = await supabase
        .from('work_order_materials')
        .select('receipt_document_id')
        .eq('work_order_id', workOrderId)
        .not('receipt_document_id', 'is', null);
      
      if (materialsError) {
        console.error('Error fetching material receipts:', materialsError);
        return;
      }
      
      // Extract document IDs from materials
      const receiptDocumentIds = materialsData
        .map(material => material.receipt_document_id)
        .filter(id => id !== null);
      
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
          receiptDocuments = receiptsData.map(doc => ({
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
            const { data, error } = await supabase.storage
              .from('construction_documents') // Using the correct bucket name
              .createSignedUrl(doc.storage_path, 300); // 5 minutes expiration
              
            if (error) {
              console.error('Error generating signed URL for', doc.document_id, error);
            } else {
              url = data.signedUrl;
            }
          }
          
          return {
            ...doc,
            url
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
