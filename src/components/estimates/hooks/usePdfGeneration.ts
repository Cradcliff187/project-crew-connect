
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const usePdfGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const generatePdf = async (estimateId: string, revisionId?: string): Promise<string | null> => {
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
        
        if (error) {
          throw new Error('No current revision found for this estimate');
        }
        
        revisionId = data.id;
      }
      
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
        .eq('revision_id', revisionId)
        .order('created_at', { ascending: true });

      if (itemsError) throw itemsError;

      // Format data for PDF generation
      const estimateData = {
        estimateId: estimate.estimateid,
        revisionId: revision.id,
        customerName: estimate.customername || 'Unknown Customer',
        projectName: estimate.projectname || 'Unnamed Project',
        revisionNumber: revision.version,
        estimateDate: new Date(revision.revision_date || new Date()).toLocaleDateString(),
        items: items?.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price
        })) || [],
        totalAmount: estimate.estimateamount || 0,
        contingencyAmount: estimate.contingencyamount,
        siteLocation: {
          address: estimate.sitelocationaddress,
          city: estimate.sitelocationcity,
          state: estimate.sitelocationstate,
          zip: estimate.sitelocationzip
        },
        notes: estimate["job description"] || '',
        contingencyPercentage: estimate.contingency_percentage
      };

      // Call the API endpoint to generate and save the PDF
      const response = await fetch('/api/generate-estimate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(estimateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate PDF');
      }

      const result = await response.json();
      const documentId = result.documentId;

      if (documentId) {
        // Update the revision with the new PDF document ID
        await supabase
          .from('estimate_revisions')
          .update({
            pdf_document_id: documentId,
            updated_at: new Date().toISOString()
          })
          .eq('id', revisionId);

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
  
  // Check if a revision already has a PDF document
  const checkRevisionPdf = async (revisionId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('estimate_revisions')
        .select('pdf_document_id')
        .eq('id', revisionId)
        .single();
      
      if (error) {
        console.error('Error checking revision PDF:', error);
        return null;
      }
      
      return data?.pdf_document_id || null;
    } catch (error) {
      console.error('Error checking revision PDF:', error);
      return null;
    }
  };
  
  return {
    generatePdf,
    checkRevisionPdf,
    isGenerating
  };
};

export default usePdfGeneration;
