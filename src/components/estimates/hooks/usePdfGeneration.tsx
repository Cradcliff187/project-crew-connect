
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PdfGenerationError extends Error {
  code?: string;
  details?: string;
}

interface UsePdfGenerationProps {
  onSuccess?: (documentId: string) => void;
  onError?: (error: PdfGenerationError) => void;
}

const usePdfGeneration = ({ onSuccess, onError }: UsePdfGenerationProps = {}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<PdfGenerationError | null>(null);

  const checkRevisionPdf = useCallback(async (revisionId: string): Promise<string | null> => {
    try {
      const { data: revisionData, error: revisionError } = await supabase
        .from('estimate_revisions')
        .select('pdf_document_id')
        .eq('id', revisionId)
        .single();

      if (revisionError) throw revisionError;
      return revisionData?.pdf_document_id || null;
    } catch (err: any) {
      console.error("Error checking revision PDF:", err);
      return null;
    }
  }, []);

  const generatePdf = useCallback(async (estimateId: string, revisionId: string) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Get estimate and revision data
      const { data: estimateData, error: estimateError } = await supabase
        .from('estimates')
        .select(`
          estimateid,
          projectname,
          customername,
          job_description,
          sitelocationaddress,
          sitelocationcity,
          sitelocationstate,
          sitelocationzip,
          contingency_percentage
        `)
        .eq('estimateid', estimateId)
        .single();
      
      if (estimateError) throw estimateError;
      
      // Get revision items
      const { data: revisionItems, error: itemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', revisionId);
      
      if (itemsError) throw itemsError;
      
      // Get revision details
      const { data: revision, error: revError } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('id', revisionId)
        .single();
      
      if (revError) throw revError;
      
      // Use RPC call to generate PDF (assuming this exists in your Supabase)
      const { data: pdfResult, error: pdfError } = await supabase
        .rpc('generate_estimate_pdf', {
          p_estimate_id: estimateId,
          p_revision_id: revisionId,
          p_items: revisionItems || []
        });
      
      if (pdfError) {
        const enhancedError: PdfGenerationError = new Error(pdfError.message);
        enhancedError.code = pdfError.code;
        enhancedError.details = 'Error generating PDF';
        throw enhancedError;
      }
      
      if (!pdfResult || !pdfResult.document_id) {
        throw new Error('No document ID returned from PDF generation');
      }
      
      // Update the revision with the PDF document ID if it's not already set
      if (!revision.pdf_document_id) {
        await supabase
          .from('estimate_revisions')
          .update({ pdf_document_id: pdfResult.document_id })
          .eq('id', revisionId);
      }
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess(pdfResult.document_id);
      }
      
      return pdfResult.document_id;
      
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      
      const pdfError: PdfGenerationError = new Error(
        err.message || 'Unknown error occurred while generating PDF'
      );
      
      if (err.code) pdfError.code = err.code;
      if (err.details) pdfError.details = err.details;
      
      setError(pdfError);
      
      if (onError) {
        onError(pdfError);
      }
      
      throw pdfError;
    } finally {
      setIsGenerating(false);
    }
  }, [onSuccess, onError]);

  return {
    generatePdf,
    checkRevisionPdf,
    isGenerating,
    error
  };
};

export default usePdfGeneration;
