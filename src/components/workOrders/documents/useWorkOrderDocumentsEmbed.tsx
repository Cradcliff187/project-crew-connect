import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderDocument } from '../details/DocumentsList/types';

export const useWorkOrderDocumentsEmbed = (workOrderId: string, entityType: string) => {
  const [documents, setDocuments] = useState<WorkOrderDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(
          'Fetching documents for work order:',
          workOrderId,
          'and entity type:',
          entityType
        );

        // Fetch documents for the work order
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('entity_type', entityType)
          .eq('entity_id', workOrderId);

        if (error) {
          console.error('Error fetching documents:', error);
          setError(error.message);
          return;
        }

        console.log('Fetched documents:', data);

        // Fetch expense documents
        const { data: expenseData, error: expenseError } = await supabase
          .from('expenses')
          .select('document_id')
          .eq('entity_id', workOrderId)
          .eq('entity_type', 'WORK_ORDER')
          .not('document_id', 'is', null);

        if (expenseError) {
          console.error('Error fetching expense documents:', expenseError);
        }

        // Get document IDs from expenses
        const expenseDocIds = expenseData?.map(exp => exp.document_id).filter(Boolean) || [];
        console.log('Expense document IDs:', expenseDocIds);

        // Fetch expense document details if there are any
        let expenseDocuments: any[] = [];
        if (expenseDocIds.length > 0) {
          const { data: expenseDocsData, error: expenseDocsError } = await supabase
            .from('documents')
            .select('*')
            .in('document_id', expenseDocIds);

          if (expenseDocsError) {
            console.error('Error fetching expense documents:', expenseDocsError);
          } else {
            expenseDocuments = expenseDocsData || [];
            console.log('Fetched expense documents:', expenseDocuments);
          }
        }

        // Combine direct and expense documents
        const allDocs = [...(data || []), ...expenseDocuments];

        // Process the documents to get public URLs
        const docsWithUrls = await Promise.all(
          allDocs.map(async doc => {
            const { data: urlData } = await supabase.storage
              .from('construction_documents')
              .getPublicUrl(doc.storage_path);

            return {
              ...doc,
              document_id: doc.document_id,
              url: urlData.publicUrl,
              is_receipt: doc.is_expense || false,
            } as WorkOrderDocument;
          })
        );

        console.log('Documents with URLs:', docsWithUrls);
        setDocuments(docsWithUrls);
      } catch (err) {
        console.error('Error in useWorkOrderDocumentsEmbed:', err);
        setError('Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    };

    if (workOrderId) {
      fetchDocuments();
    }
  }, [workOrderId, entityType, refreshTrigger]);

  const refetchDocuments = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return {
    documents,
    loading,
    error,
    refetchDocuments,
  };
};
