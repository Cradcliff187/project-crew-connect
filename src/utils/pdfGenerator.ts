
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '@/integrations/supabase/client';

/**
 * Generate a PDF from an HTML element
 * @param element The HTML element to convert to PDF
 * @param filename The name of the PDF file
 * @param options Additional options for PDF generation
 * @returns Promise resolving to the PDF document and generated blob
 */
export const generatePDF = async (
  element: HTMLElement, 
  filename: string,
  options: {
    format?: 'a4' | 'letter' | 'legal',
    orientation?: 'portrait' | 'landscape',
    marginTop?: number,
    marginRight?: number,
    marginBottom?: number,
    marginLeft?: number,
    addHeader?: boolean,
    addFooter?: boolean,
    companyName?: string,
    companyLogo?: string
  } = {}
) => {
  if (!element) {
    console.error('No element provided for PDF generation');
    return { pdf: null, blob: null };
  }

  // Set default options
  const {
    format = 'a4',
    orientation = 'portrait',
    marginTop = 15,
    marginRight = 15,
    marginBottom = 15,
    marginLeft = 15,
    addHeader = true,
    addFooter = true,
    companyName = 'AKC LLC',
    companyLogo = ''
  } = options;

  try {
    // Create new jsPDF instance
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });

    // Get page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Set background color for the document content
    element.style.backgroundColor = 'white';
    
    // Convert HTML element to canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Convert canvas to image
    const imgData = canvas.toDataURL('image/png');
    
    // Calculate image dimensions to fit PDF page with margins
    const imgWidth = pageWidth - marginLeft - marginRight;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add company header if requested
    if (addHeader) {
      pdf.setFillColor(4, 133, 234); // #0485ea
      pdf.rect(0, 0, pageWidth, 15, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.text(companyName, marginLeft, 10);
      pdf.setTextColor(0, 0, 0);
    }

    // Add the image (content) to the PDF
    let yPosition = addHeader ? marginTop + 5 : marginTop;
    
    // If image height is greater than page height (minus margins and header/footer), split into multiple pages
    const contentHeight = pageHeight - yPosition - (addFooter ? 10 : 0) - marginBottom;
    
    if (imgHeight <= contentHeight) {
      // Image fits on one page
      pdf.addImage(imgData, 'PNG', marginLeft, yPosition, imgWidth, imgHeight);
    } else {
      // Image needs multiple pages
      let remainingHeight = imgHeight;
      let sourceY = 0;
      
      while (remainingHeight > 0) {
        // Add image portion to current page
        pdf.addImage({
          imageData: imgData,
          format: 'PNG',
          x: marginLeft,
          y: yPosition,
          width: imgWidth,
          height: Math.min(contentHeight, remainingHeight),
          alias: undefined,
          compression: 'NONE',
          rotation: 0
        });
        
        remainingHeight -= contentHeight;
        sourceY += (contentHeight * canvas.height) / imgHeight;
        
        if (remainingHeight > 0) {
          // Add a new page
          pdf.addPage();
          // Reset yPosition for new page
          yPosition = addHeader ? marginTop + 5 : marginTop;
          
          // Add header to new page if needed
          if (addHeader) {
            pdf.setFillColor(4, 133, 234); // #0485ea
            pdf.rect(0, 0, pageWidth, 15, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(12);
            pdf.text(companyName, marginLeft, 10);
            pdf.setTextColor(0, 0, 0);
          }
        }
      }
    }
    
    // Add footer if requested
    if (addFooter) {
      const totalPages = pdf.getNumberOfPages();
      
      // Add footer to all pages
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Page ${i} of ${totalPages} - Generated on ${new Date().toLocaleDateString()}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
    }

    // Create a blob from the PDF
    const blob = pdf.output('blob');
    
    return { pdf, blob };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { pdf: null, blob: null };
  }
};

/**
 * Generate an estimate PDF
 */
export const generateEstimatePDF = async (
  estimateElement: HTMLElement,
  estimateData: {
    id: string;
    client: string;
    project: string;
    date: string;
    revision?: number;
  }
) => {
  const revisionSuffix = estimateData.revision ? `_Rev${estimateData.revision}` : '';
  const filename = `Estimate_${estimateData.id}${revisionSuffix}_${estimateData.client.replace(/\s+/g, '_')}`;
  
  return generatePDF(estimateElement, filename, {
    addHeader: true,
    addFooter: true,
    companyName: `AKC LLC - Estimate${estimateData.revision ? ` Revision ${estimateData.revision}` : ''}`
  });
};

/**
 * Upload a PDF blob to Supabase Storage and create document record
 */
export const uploadRevisionPDF = async (
  blob: Blob,
  estimateId: string,
  revisionId: string,
  revisionNumber: number,
  clientName: string
): Promise<string | null> => {
  try {
    // Generate a filename for the PDF
    const timestamp = Date.now();
    const sanitizedClientName = clientName.replace(/\s+/g, '_');
    const filename = `Estimate_${estimateId}_Rev${revisionNumber}_${sanitizedClientName}_${timestamp}.pdf`;
    
    // Upload the PDF to Supabase Storage
    const { data: fileData, error: uploadError } = await supabase
      .storage
      .from('construction_documents')
      .upload(`estimates/${estimateId}/${filename}`, blob, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      });
    
    if (uploadError) throw uploadError;
    
    if (!fileData?.path) throw new Error('No file path returned from upload');
    
    // Create a document record
    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .insert({
        file_name: filename,
        file_type: 'application/pdf',
        file_size: blob.size,
        storage_path: fileData.path,
        entity_type: 'ESTIMATE',
        entity_id: estimateId,
        category: 'revision_pdf',
        version: 1,
        is_latest_version: true,
        notes: `PDF for estimate ${estimateId}, revision ${revisionNumber}`
      })
      .select('document_id')
      .single();
    
    if (documentError) throw documentError;
    
    // Update the revision record with the PDF document ID
    const { error: revisionError } = await supabase
      .from('estimate_revisions')
      .update({
        pdf_document_id: documentData.document_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', revisionId);
    
    if (revisionError) throw revisionError;
    
    return documentData.document_id;
  } catch (error) {
    console.error('Error uploading revision PDF:', error);
    return null;
  }
};
