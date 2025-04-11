
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PdfGenerationError extends Error {
  code?: string;
  details?: string;
}

interface UsePdfGenerationProps {
  onSuccess?: (documentId: string) => void;
  onError?: (error: PdfGenerationError) => void;
}

interface PdfResult {
  document_id: string;
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

  /**
   * Generate a PDF on the server using Supabase RPC
   */
  const generatePdf = useCallback(async (estimateId: string, revisionId?: string) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // If no revisionId is provided, we can't generate a PDF on the server
      if (!revisionId) {
        throw new Error("Revision ID is required for server-side PDF generation");
      }
      
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
      
      // Use fetch to call the function directly since RPC isn't working correctly
      const { data: pdfResult, error: pdfError } = await supabase.functions.invoke<PdfResult>('generate-estimate-pdf', {
        body: {
          estimate_id: estimateId,
          revision_id: revisionId,
          items: revisionItems || []
        }
      });
      
      if (pdfError) {
        const enhancedError: PdfGenerationError = new Error(pdfError.message);
        enhancedError.code = pdfError.name;
        enhancedError.details = 'Error generating PDF';
        throw enhancedError;
      }
      
      if (!pdfResult || !pdfResult.document_id) {
        throw new Error('No document ID returned from PDF generation');
      }
      
      // Update the revision with the PDF document ID if it's not already set
      if (revision && !revision.pdf_document_id) {
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

  /**
   * Generate a PDF client-side using jsPDF
   */
  const generateClientSidePdf = useCallback(async (contentRef: React.RefObject<HTMLDivElement>) => {
    setIsGenerating(true);
    setError(null);

    try {
      if (!contentRef || !contentRef.current) {
        throw new Error('Content reference is required for client-side PDF generation');
      }

      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Get the content from the ref
      const content = contentRef.current;
      const estimate = content.querySelector('.estimate-data');
      
      if (!estimate) {
        throw new Error('Could not find estimate data in the provided content');
      }

      // Add title
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(4, 133, 234); // Using AKC blue color
      pdf.text('ESTIMATE', 105, 20, { align: 'center' });
      
      // Add company info
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AKC LLC', 20, 35);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('123 Main Street', 20, 40);
      pdf.text('Anytown, CA 12345', 20, 45);
      pdf.text('(123) 456-7890', 20, 50);
      
      // Extract estimate details
      const projectName = content.querySelector('[data-field="project-name"]')?.textContent || 'N/A';
      const estimateNumber = content.querySelector('[data-field="estimate-number"]')?.textContent || 'N/A';
      const customerName = content.querySelector('[data-field="customer-name"]')?.textContent || 'N/A';
      const date = content.querySelector('[data-field="date"]')?.textContent || new Date().toLocaleDateString();
      
      // Add estimate info
      pdf.setFont('helvetica', 'bold');
      pdf.text('Project:', 140, 35);
      pdf.text('Estimate #:', 140, 40);
      pdf.text('Customer:', 140, 45);
      pdf.text('Date:', 140, 50);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(projectName, 170, 35);
      pdf.text(estimateNumber, 170, 40);
      pdf.text(customerName, 170, 45);
      pdf.text(date, 170, 50);
      
      // Add items table
      const items = Array.from(content.querySelectorAll('.estimate-item'));
      
      const tableData = items.map(item => {
        const description = item.querySelector('[data-field="description"]')?.textContent || '';
        const quantity = item.querySelector('[data-field="quantity"]')?.textContent || '';
        const unitPrice = item.querySelector('[data-field="unit-price"]')?.textContent || '';
        const total = item.querySelector('[data-field="total"]')?.textContent || '';
        
        return [description, quantity, unitPrice, total];
      });
      
      // Add line items table
      autoTable(pdf, {
        startY: 60,
        head: [['Description', 'Quantity', 'Unit Price', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [4, 133, 234],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        }
      });
      
      // Get final Y position after table
      const finalY = (pdf as any).lastAutoTable.finalY || 150;
      
      // Add summary information
      const subtotal = content.querySelector('[data-field="subtotal"]')?.textContent || '0';
      const contingency = content.querySelector('[data-field="contingency"]')?.textContent || '0';
      const total = content.querySelector('[data-field="total"]')?.textContent || '0';
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Subtotal:', 140, finalY + 10);
      pdf.text('Contingency:', 140, finalY + 15);
      pdf.text('TOTAL:', 140, finalY + 25);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(subtotal, 170, finalY + 10, { align: 'right' });
      pdf.text(contingency, 170, finalY + 15, { align: 'right' });
      
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(4, 133, 234); // AKC blue for total
      pdf.text(total, 170, finalY + 25, { align: 'right' });
      
      // Add terms and conditions
      pdf.setTextColor(0, 0, 0); // Reset to black
      pdf.setFontSize(11);
      pdf.text('Terms & Conditions', 20, finalY + 40);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const terms = [
        '1. This estimate is valid for 30 days from the date issued.',
        '2. A 50% deposit is required before work begins.',
        '3. Changes to scope may result in additional charges.',
        '4. Final payment is due upon completion of work.'
      ];
      
      terms.forEach((term, i) => {
        pdf.text(term, 20, finalY + 45 + (i * 5));
      });
      
      // Add footer with page number
      pdf.setFontSize(8);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 280);
      pdf.text('Page 1 of 1', 190, 280, { align: 'right' });
      
      // Save the PDF
      pdf.save(`Estimate-${estimateNumber}.pdf`);

      // For consistency with server-side generation, return a placeholder document ID
      const placeholderDocId = `client-gen-${Date.now()}`;
      
      if (onSuccess) {
        onSuccess(placeholderDocId);
      }
      
      return placeholderDocId;
      
    } catch (err: any) {
      console.error('Error generating client-side PDF:', err);
      
      const pdfError: PdfGenerationError = new Error(
        err.message || 'Unknown error occurred while generating client-side PDF'
      );
      
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
    generateClientSidePdf,
    checkRevisionPdf,
    isGenerating,
    error
  };
};

export default usePdfGeneration;
