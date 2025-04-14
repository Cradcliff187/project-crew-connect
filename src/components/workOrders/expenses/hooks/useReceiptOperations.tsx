import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useReceiptOperations(fetchExpenses: () => Promise<void>) {
  const [submitting, setSubmitting] = useState(false);

  const handleReceiptUploaded = async (expenseId: string, documentId: string) => {
    if (!expenseId || !documentId) {
      toast({
        title: 'Error',
        description: 'Missing expense ID or document ID.',
        variant: 'destructive',
      });
      return false;
    }

    setSubmitting(true);

    try {
      console.log('Attaching receipt document to expense:', { expenseId, documentId });

      // Update the document to mark it as an expense/receipt
      const { error: docError } = await supabase
        .from('documents')
        .update({
          is_expense: true,
          category: 'receipt',
        })
        .eq('document_id', documentId);

      if (docError) {
        console.error('Error updating document:', docError);
      }

      // Update the expense with the document ID
      const { error } = await supabase
        .from('expenses')
        .update({ document_id: documentId })
        .eq('id', expenseId);

      if (error) {
        throw error;
      }

      console.log('Receipt attached successfully');

      toast({
        title: 'Receipt Attached',
        description: 'Receipt has been attached to the expense successfully.',
      });

      // Refresh expenses list
      await fetchExpenses();

      return true;
    } catch (error: any) {
      console.error('Error attaching receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to attach receipt: ' + error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    handleReceiptUploaded,
  };
}
