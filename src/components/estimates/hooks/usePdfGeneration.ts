
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export interface PdfGenerationOptions {
  onSuccess?: (documentId: string) => void;
  onError?: (error: Error) => void;
}

export const usePdfGeneration = (options?: PdfGenerationOptions) => {
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

      // Create a PDF document
      const doc = new jsPDF();
      
      // Add document title and header
      doc.setFontSize(20);
      doc.setTextColor(4, 133, 234); // #0485ea - brand color
      doc.text('AKC LLC', 20, 20);
      
      doc.setFontSize(16);
      doc.text(`ESTIMATE #${estimateId}`, 20, 30);
      
      if (revision.version > 1) {
        doc.setFontSize(12);
        doc.text(`Revision ${revision.version}`, 100, 30);
      }
      
      // Add estimate details
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Date: ${new Date(revision.revision_date || new Date()).toLocaleDateString()}`, 20, 40);
      
      // Add client info
      doc.text('Client:', 20, 50);
      doc.setFontSize(11);
      doc.text(estimate.customername || 'Unknown Customer', 20, 56);
      
      // Add project info
      doc.setFontSize(12);
      doc.text('Project:', 20, 66);
      doc.setFontSize(11);
      doc.text(estimate.projectname || 'Unnamed Project', 20, 72);
      
      // Add site location if available
      let yPosition = 82;
      if (estimate.sitelocationaddress || estimate.sitelocationcity) {
        doc.setFontSize(12);
        doc.text('Location:', 20, yPosition);
        doc.setFontSize(11);
        
        if (estimate.sitelocationaddress) {
          doc.text(estimate.sitelocationaddress, 20, yPosition + 6);
          yPosition += 6;
        }
        
        const cityState = [];
        if (estimate.sitelocationcity) cityState.push(estimate.sitelocationcity);
        if (estimate.sitelocationstate) cityState.push(estimate.sitelocationstate);
        if (cityState.length > 0) {
          doc.text(cityState.join(', ') + (estimate.sitelocationzip ? ' ' + estimate.sitelocationzip : ''), 
            20, yPosition + 6);
          yPosition += 6;
        }
        
        yPosition += 10;
      }
      
      // Add description if available
      if (estimate["job description"]) {
        doc.setFontSize(12);
        doc.text('Description:', 20, yPosition);
        doc.setFontSize(11);
        
        const descText = doc.splitTextToSize(estimate["job description"], 170);
        doc.text(descText, 20, yPosition + 6);
        
        yPosition += 6 + (descText.length * 5);
      }
      
      yPosition += 10;
      
      // Add items table
      const tableColumn = ["Description", "Quantity", "Unit Price", "Total"];
      const tableRows: any[] = [];
      
      if (items && items.length > 0) {
        items.forEach(item => {
          const itemData = [
            item.description,
            item.quantity.toString(),
            formatCurrency(item.unit_price),
            formatCurrency(item.total_price)
          ];
          tableRows.push(itemData);
        });
      }
      
      // Add table to document
      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: yPosition,
        theme: 'grid',
        headStyles: {
          fillColor: [4, 133, 234],
          textColor: [255, 255, 255]
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30, halign: 'right' },
          2: { cellWidth: 40, halign: 'right' },
          3: { cellWidth: 40, halign: 'right' }
        }
      });
      
      // Calculate table end position
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      
      // Add subtotal and total
      const subtotalAmount = items?.reduce((sum, item) => sum + item.total_price, 0) || 0;
      doc.text('Subtotal:', 140, finalY);
      doc.text(formatCurrency(subtotalAmount), 180, finalY, { align: 'right' });
      
      // Add contingency if applicable
      if (estimate.contingency_percentage && estimate.contingencyamount) {
        doc.text(`Contingency (${estimate.contingency_percentage}%):`, 140, finalY + 7);
        doc.text(formatCurrency(estimate.contingencyamount), 180, finalY + 7, { align: 'right' });
      }
      
      // Add total
      doc.setFontSize(12);
      doc.setTextColor(4, 133, 234);
      doc.text('TOTAL:', 140, finalY + 14);
      doc.text(formatCurrency(estimate.estimateamount), 180, finalY + 14, { align: 'right' });
      
      // Add footer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for your business!', 105, 280, { align: 'center' });
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 285, { align: 'center' });
      
      // Generate the PDF blob
      const pdfBlob = doc.output('blob');
      
      // Save the PDF to Supabase storage
      const timestamp = Date.now();
      const fileName = `${estimateId}_rev${revision.version}_${timestamp}.pdf`;
      const filePath = `estimates/${estimateId}/${fileName}`;
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('construction_documents')
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          cacheControl: '3600'
        });
        
      if (uploadError) throw uploadError;
      
      // Create a document record
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          file_name: fileName,
          file_type: 'application/pdf',
          file_size: pdfBlob.size,
          storage_path: uploadData.path,
          entity_type: 'ESTIMATE',
          entity_id: estimateId,
          category: 'estimate_pdf',
          version: revision.version,
          is_latest_version: true,
          notes: `PDF for estimate ${estimateId}, revision ${revision.version}`
        })
        .select('document_id')
        .single();
        
      if (docError) throw docError;
      
      // Update the revision with the PDF document ID
      await supabase
        .from('estimate_revisions')
        .update({
          pdf_document_id: docData.document_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', revisionId);

      toast({
        title: 'PDF Generated',
        description: 'The PDF has been generated and saved successfully',
        className: 'bg-[#0485ea] text-white',
      });
      
      if (options?.onSuccess) {
        options.onSuccess(docData.document_id);
      }
      
      return docData.document_id;
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast({
        title: 'PDF Generation Failed',
        description: error.message || 'There was an error generating the PDF',
        variant: 'destructive',
      });
      
      if (options?.onError) {
        options.onError(error);
      }
      
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
  
  // Helper function to format currency
  const formatCurrency = (value?: number): string => {
    if (value === undefined || value === null) return '$0.00';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2 
    }).format(value);
  };
  
  return {
    generatePdf,
    checkRevisionPdf,
    isGenerating
  };
};

export default usePdfGeneration;
