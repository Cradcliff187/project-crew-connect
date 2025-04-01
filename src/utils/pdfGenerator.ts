
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate a PDF from an HTML element
 * @param element The HTML element to convert to PDF
 * @param filename The name of the PDF file
 * @param options Additional options for PDF generation
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
    return null;
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

    // Save the PDF
    pdf.save(`${filename}.pdf`);
    
    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return null;
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
  }
) => {
  const filename = `Estimate_${estimateData.id}_${estimateData.client.replace(/\s+/g, '_')}`;
  
  return generatePDF(estimateElement, filename, {
    addHeader: true,
    addFooter: true,
    companyName: 'AKC LLC - Estimate'
  });
};
