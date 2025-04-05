
import { useState } from 'react';
import { uploadRevisionPDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseRevisionPdfOptions {
  onSuccess?: (documentId: string) => void;
  onError?: (error: Error) => void;
}

export const useRevisionPdf = (options?: UseRevisionPdfOptions) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  // Generate and upload PDF for a revision
  const generateRevisionPdf = async (
    element: HTMLElement,
    estimateId: string,
    revisionId: string,
    revisionNumber: number,
    clientName: string
  ) => {
    setIsGenerating(true);
    
    try {
      // Clone the element to avoid modifying the visible DOM
      const elementToExport = element.cloneNode(true) as HTMLElement;
      
      // Temporarily append to document but hide it
      elementToExport.style.position = 'absolute';
      elementToExport.style.left = '-9999px';
      elementToExport.style.overflow = 'visible';
      elementToExport.style.height = 'auto';
      document.body.appendChild(elementToExport);
      
      // Generate PDF blob using html2canvas and jsPDF
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(elementToExport, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      document.body.removeChild(elementToExport);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 30;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add the image to the PDF
      pdf.addImage(imgData, 'PNG', 15, 15, imgWidth, imgHeight);
      
      // Convert PDF to blob
      const blob = pdf.output('blob');
      
      // Upload the PDF to storage and link it to the revision
      const documentId = await uploadRevisionPDF(
        blob,
        estimateId,
        revisionId,
        revisionNumber,
        clientName
      );
      
      if (documentId) {
        toast({
          title: 'PDF Generated',
          description: 'PDF has been generated and saved for this revision',
          className: 'bg-[#0485ea] text-white'
        });
        
        if (options?.onSuccess) {
          options.onSuccess(documentId);
        }
        
        return documentId;
      } else {
        throw new Error('Failed to upload PDF');
      }
    } catch (error) {
      console.error('Error generating revision PDF:', error);
      
      toast({
        title: 'PDF Generation Failed',
        description: 'There was an error creating the PDF',
        variant: 'destructive'
      });
      
      if (options?.onError) {
        options.onError(error as Error);
      }
      
      return null;
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Check if a revision already has a PDF document
  const checkRevisionPdf = async (revisionId: string) => {
    try {
      // Use proper error handling with type checking
      const { data, error } = await supabase
        .from('estimate_revisions')
        .select('pdf_document_id')
        .eq('id', revisionId)
        .single();
      
      if (error) {
        console.error('Error checking revision PDF:', error);
        return null;
      }
      
      // Safe access with optional chaining
      return data?.pdf_document_id || null;
    } catch (error) {
      console.error('Error checking revision PDF:', error);
      return null;
    }
  };
  
  return {
    generateRevisionPdf,
    checkRevisionPdf,
    isGenerating
  };
};

export default useRevisionPdf;
