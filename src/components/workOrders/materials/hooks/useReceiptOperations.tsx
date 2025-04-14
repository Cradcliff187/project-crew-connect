import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useReceiptOperations(fetchMaterials: () => Promise<void>) {
  const handleReceiptUploaded = async (materialId: string, documentId: string) => {
    try {
      console.log('Attaching receipt:', { materialId, documentId });
      const { error } = await supabase
        .from('expenses')
        .update({ document_id: documentId })
        .eq('id', materialId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Receipt Attached',
        description: 'Receipt has been attached to the material successfully.',
      });

      // Refresh materials list
      fetchMaterials();
    } catch (error: any) {
      console.error('Error attaching receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to attach receipt: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    handleReceiptUploaded,
  };
}
