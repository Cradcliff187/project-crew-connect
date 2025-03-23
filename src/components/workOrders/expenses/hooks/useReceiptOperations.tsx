
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
      return;
    }
    
    setSubmitting(true);
    
    try {
      console.log('Attaching receipt document to expense:', { expenseId, documentId });
      
      const { error } = await (supabase as any)
        .from('work_order_materials')
        .update({ receipt_document_id: documentId })
        .eq('id', expenseId);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Receipt Attached',
        description: 'Receipt has been attached to the expense successfully.',
      });
      
      // Refresh expenses list
      fetchExpenses();
      
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
    handleReceiptUploaded
  };
}
