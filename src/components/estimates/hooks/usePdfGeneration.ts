
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateAndSavePdf } from '../utils/estimatePdfGenerator';

export const usePdfGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const generatePdf = async (estimateId: string, revisionId: string) => {
    setIsGenerating(true);
    try {
      const documentId = await generateAndSavePdf(estimateId, revisionId);
      
      if (documentId) {
        toast({
          title: 'PDF Generated',
          description: 'The PDF has been generated and saved successfully',
          className: 'bg-[#0485ea] text-white',
        });
        return documentId;
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast({
        title: 'PDF Generation Failed',
        description: error.message || 'There was an error generating the PDF',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };
  
  return {
    generatePdf,
    isGenerating
  };
};

export default usePdfGeneration;
