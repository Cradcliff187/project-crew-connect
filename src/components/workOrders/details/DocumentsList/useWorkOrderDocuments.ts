import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { WorkOrderDocument } from './types';

export const useWorkOrderDocuments = (workOrderId: string) => {
  const [documents, setDocuments] = useState<WorkOrderDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    if (!workOrderId) return;

    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching documents for work order: ${workOrderId}`);

      // First, fetch direct documents for the work order
      const { data: directDocs, error: directError } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', 'WORK_ORDER')
        .eq('entity_id', workOrderId);

      if (directError) {
        throw directError;
      }

      // Next, fetch expense documents linked to this work order
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .select('document_id')
        .eq('entity_id', workOrderId)
        .eq('entity_type', 'WORK_ORDER')
        .not('document_id', 'is', null);

      if (expenseError) {
        console.error('Error fetching expense document IDs:', expenseError);
      }

      // Get unique document IDs from expenses
      const expenseDocIds = expenseData
        ? [...new Set(expenseData.map(exp => exp.document_id).filter(Boolean))]
        : [];

      // Fetch expense document details if there are any
      let expenseDocs: any[] = [];
      if (expenseDocIds.length > 0) {
        const { data: expenseDocsData, error: expenseDocsError } = await supabase
          .from('documents')
          .select('*')
          .in('document_id', expenseDocIds);

        if (expenseDocsError) {
          console.error('Error fetching expense documents:', expenseDocsError);
        } else {
          expenseDocs = expenseDocsData || [];
        }
      }

      // Combine direct documents and expense documents
      const allDocs = [...(directDocs || []), ...expenseDocs];

      // Get storage URLs for each document
      const docsWithUrls = await Promise.all(
        allDocs.map(async doc => {
          const { data: urlData } = await supabase.storage
            .from('construction_documents')
            .getPublicUrl(doc.storage_path);

          return {
            ...doc,
            url: urlData.publicUrl,
            is_receipt: doc.is_expense || doc.category === 'receipt',
          } as WorkOrderDocument;
        })
      );

      setDocuments(docsWithUrls);
    } catch (error: any) {
      console.error('Error fetching work order documents:', error);
      setError(error.message);
      toast({
        title: 'Error',
        description: 'Could not load documents. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workOrderId) {
      fetchDocuments();
    }
  }, [workOrderId]);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
  };
};
