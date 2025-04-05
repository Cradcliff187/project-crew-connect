
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateEstimatePdf, savePdfToStorage } from '../utils/estimatePdfGenerator';
import { supabase } from '@/integrations/supabase/client';

export const usePdfGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const generatePdf = async (estimateId: string, revisionId?: string) => {
    setIsGenerating(true);
    try {
      if (!revisionId) {
        // If no revision ID is provided, find the current revision
        const { data, error } = await supabase
          .from('estimate_revisions')
          .select('id')
          .eq('estimate_id', estimateId)
          .eq('is_current', true)
          .single();
        
        if (error) throw new Error('No current revision found for this estimate');
        revisionId = data.id;
      }
      
      // Generate and save the PDF using the estimatePdfGenerator utility
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

// Generate and save a PDF for an estimate revision by calling the utility functions
const generateAndSavePdf = async (estimateId: string, revisionId: string): Promise<string | null> => {
  try {
    // Fetch estimate data
    const { data: estimate, error: estimateError } = await supabase
      .from('estimates')
      .select('*')
      .eq('estimateid', estimateId)
      .single();

    if (estimateError) throw estimateError;

    // Fetch revision data
    const { data: revision, error: revisionError } = await supabase
      .from('estimate_revisions')
      .select('*')
      .eq('id', revisionId)
      .single();

    if (revisionError) throw revisionError;

    // Fetch estimate items
    const { data: items, error: itemsError } = await supabase
      .from('estimate_items')
      .select('*')
      .eq('revision_id', revisionId);

    if (itemsError) throw itemsError;

    // Format data for PDF generation
    const estimateData = {
      estimateId: estimate.estimateid,
      revisionId: revision.id,
      customerName: estimate.customername || 'Unknown Customer',
      projectName: estimate.projectname || 'Unnamed Project',
      revisionNumber: revision.version,
      estimateDate: new Date(revision.revision_date).toLocaleDateString(),
      items: items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price
      })),
      totalAmount: estimate.estimateamount || 0,
      contingencyAmount: estimate.contingencyamount,
      siteLocation: {
        address: estimate.sitelocationaddress,
        city: estimate.sitelocationcity,
        state: estimate.sitelocationstate,
        zip: estimate.sitelocationzip
      },
      notes: estimate["job description"]
    };

    // Generate the PDF
    const pdfBlob = await generateEstimatePdf(estimateData);

    // Save the PDF to storage and get document ID
    const documentId = await savePdfToStorage(pdfBlob, estimateId, revisionId);

    return documentId;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return null;
  }
};

export default usePdfGeneration;
