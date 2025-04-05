
import { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { formatCurrency } from '@/lib/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const {
      estimateId,
      revisionId,
      customerName,
      projectName,
      revisionNumber,
      estimateDate,
      items,
      totalAmount,
      contingencyAmount,
      siteLocation,
      notes,
      contingencyPercentage
    } = req.body;
    
    if (!estimateId || !revisionId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add a blank page
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    
    // Load the font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Define constants
    const margin = 50;
    const textSize = 10;
    const headerSize = 16;
    const subheaderSize = 12;
    const { width, height } = page.getSize();
    
    // Add company logo/name at the top
    page.drawText('AKC LLC', {
      x: margin,
      y: height - margin,
      size: 24,
      font: helveticaBold,
      color: rgb(0.03, 0.52, 0.91), // AKC blue color (#0485ea)
    });
    
    // Add estimate title
    page.drawText(`ESTIMATE #${estimateId}`, {
      x: margin,
      y: height - margin - 40,
      size: headerSize,
      font: helveticaBold,
    });
    
    if (revisionNumber > 1) {
      page.drawText(`Revision ${revisionNumber}`, {
        x: margin + 200,
        y: height - margin - 40,
        size: subheaderSize,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5),
      });
    }
    
    // Add date
    page.drawText(`Date: ${estimateDate}`, {
      x: margin,
      y: height - margin - 60,
      size: textSize,
      font: helveticaFont,
    });
    
    // Add client info
    page.drawText('Client:', {
      x: margin,
      y: height - margin - 90,
      size: textSize,
      font: helveticaBold,
    });
    page.drawText(customerName || 'Unknown Client', {
      x: margin,
      y: height - margin - 105,
      size: textSize,
      font: helveticaFont,
    });
    
    // Add project name
    page.drawText('Project:', {
      x: margin,
      y: height - margin - 135,
      size: textSize,
      font: helveticaBold,
    });
    page.drawText(projectName || `Project for Estimate ${estimateId}`, {
      x: margin,
      y: height - margin - 150,
      size: textSize,
      font: helveticaFont,
    });
    
    // Add site location if available
    if (siteLocation && (siteLocation.address || siteLocation.city)) {
      const locationParts = [];
      if (siteLocation.address) locationParts.push(siteLocation.address);
      
      const cityStateParts = [];
      if (siteLocation.city) cityStateParts.push(siteLocation.city);
      if (siteLocation.state) cityStateParts.push(siteLocation.state);
      if (cityStateParts.length > 0) {
        locationParts.push(cityStateParts.join(', '));
      }
      
      if (siteLocation.zip) locationParts.push(siteLocation.zip);
      
      if (locationParts.length > 0) {
        page.drawText('Location:', {
          x: margin,
          y: height - margin - 180,
          size: textSize,
          font: helveticaBold,
        });
        
        locationParts.forEach((part, index) => {
          page.drawText(part, {
            x: margin,
            y: height - margin - 195 - (index * 15),
            size: textSize,
            font: helveticaFont,
          });
        });
      }
    }
    
    // Add description/notes if available
    if (notes) {
      const noteStartY = height - margin - 240;
      
      page.drawText('Description:', {
        x: margin,
        y: noteStartY,
        size: textSize,
        font: helveticaBold,
      });
      
      // Wrap text for long descriptions
      const words = notes.split(' ');
      let line = '';
      let currentY = noteStartY - 15;
      
      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        const testWidth = helveticaFont.widthOfTextAtSize(testLine, textSize);
        
        if (testWidth > width - (2 * margin) && line) {
          page.drawText(line, {
            x: margin,
            y: currentY,
            size: textSize,
            font: helveticaFont,
          });
          line = word;
          currentY -= 15;
        } else {
          line = testLine;
        }
      }
      
      if (line) {
        page.drawText(line, {
          x: margin,
          y: currentY,
          size: textSize,
          font: helveticaFont,
        });
      }
    }
    
    // Draw line items table
    const tableStartY = height - margin - 320;
    const colWidths = [300, 60, 80, 90];
    const colPositions = [
      margin,
      margin + colWidths[0],
      margin + colWidths[0] + colWidths[1],
      margin + colWidths[0] + colWidths[1] + colWidths[2],
    ];
    
    // Draw table header
    page.drawRectangle({
      x: margin,
      y: tableStartY - 20,
      width: colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
      height: 20,
      color: rgb(0.95, 0.95, 0.95),
    });
    
    page.drawText('Description', {
      x: colPositions[0] + 5,
      y: tableStartY - 15,
      size: textSize,
      font: helveticaBold,
    });
    page.drawText('Quantity', {
      x: colPositions[1] + 5,
      y: tableStartY - 15,
      size: textSize,
      font: helveticaBold,
    });
    page.drawText('Unit Price', {
      x: colPositions[2] + 5,
      y: tableStartY - 15,
      size: textSize,
      font: helveticaBold,
    });
    page.drawText('Total Price', {
      x: colPositions[3] + 5,
      y: tableStartY - 15,
      size: textSize,
      font: helveticaBold,
    });
    
    // Draw table rows
    let currentY = tableStartY - 40;
    const rowHeight = 20;
    
    if (items && items.length > 0) {
      for (const item of items) {
        // Create a new page if needed
        if (currentY < margin + 100) {
          const newPage = pdfDoc.addPage([595.28, 841.89]);
          currentY = height - margin - 40;
          
          // Add company logo/name at the top of new page
          newPage.drawText('AKC LLC', {
            x: margin,
            y: height - margin,
            size: 24,
            font: helveticaBold,
            color: rgb(0.03, 0.52, 0.91), // AKC blue color (#0485ea)
          });
          
          // Add estimate title on new page
          newPage.drawText(`ESTIMATE #${estimateId} (Continued)`, {
            x: margin,
            y: height - margin - 40,
            size: headerSize,
            font: helveticaBold,
          });
          
          // Draw table header on new page
          newPage.drawRectangle({
            x: margin,
            y: height - margin - 70,
            width: colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
            height: 20,
            color: rgb(0.95, 0.95, 0.95),
          });
          
          newPage.drawText('Description', {
            x: colPositions[0] + 5,
            y: height - margin - 65,
            size: textSize,
            font: helveticaBold,
          });
          newPage.drawText('Quantity', {
            x: colPositions[1] + 5,
            y: height - margin - 65,
            size: textSize,
            font: helveticaBold,
          });
          newPage.drawText('Unit Price', {
            x: colPositions[2] + 5,
            y: height - margin - 65,
            size: textSize,
            font: helveticaBold,
          });
          newPage.drawText('Total Price', {
            x: colPositions[3] + 5,
            y: height - margin - 65,
            size: textSize,
            font: helveticaBold,
          });
          
          currentY = height - margin - 90;
          page = newPage;
        }
        
        // Draw row
        page.drawText(item.description, {
          x: colPositions[0] + 5,
          y: currentY,
          size: textSize,
          font: helveticaFont,
          maxWidth: colWidths[0] - 10,
        });
        
        page.drawText(item.quantity.toString(), {
          x: colPositions[1] + 5,
          y: currentY,
          size: textSize,
          font: helveticaFont,
        });
        
        page.drawText(formatCurrency(item.unitPrice), {
          x: colPositions[2] + 5,
          y: currentY,
          size: textSize,
          font: helveticaFont,
        });
        
        page.drawText(formatCurrency(item.totalPrice), {
          x: colPositions[3] + 5,
          y: currentY,
          size: textSize,
          font: helveticaFont,
        });
        
        currentY -= rowHeight;
      }
    } else {
      // If no items, show a message
      page.drawText('No items in this estimate', {
        x: colPositions[0] + 5,
        y: currentY,
        size: textSize,
        font: helveticaFont,
      });
      currentY -= rowHeight;
    }
    
    // Draw a line
    page.drawLine({
      start: { x: margin, y: currentY },
      end: { x: margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], y: currentY },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    
    currentY -= rowHeight;
    
    // Draw subtotal
    page.drawText('Subtotal', {
      x: colPositions[2] + 5,
      y: currentY,
      size: textSize,
      font: helveticaBold,
    });
    
    const subtotalAmount = items?.reduce((sum, item) => sum + item.totalPrice, 0) || 0;
    
    page.drawText(formatCurrency(subtotalAmount), {
      x: colPositions[3] + 5,
      y: currentY,
      size: textSize,
      font: helveticaBold,
    });
    
    currentY -= rowHeight;
    
    // Draw contingency if applicable
    if (contingencyPercentage && contingencyPercentage > 0 && contingencyAmount) {
      page.drawText(`Contingency (${contingencyPercentage}%)`, {
        x: colPositions[2] + 5,
        y: currentY,
        size: textSize,
        font: helveticaFont,
      });
      
      page.drawText(formatCurrency(contingencyAmount), {
        x: colPositions[3] + 5,
        y: currentY,
        size: textSize,
        font: helveticaFont,
      });
      
      currentY -= rowHeight;
    }
    
    // Draw total
    page.drawRectangle({
      x: colPositions[2],
      y: currentY - 5,
      width: colWidths[2] + colWidths[3],
      height: 25,
      color: rgb(0.95, 0.95, 0.95),
    });
    
    page.drawText('TOTAL', {
      x: colPositions[2] + 5,
      y: currentY,
      size: textSize + 2,
      font: helveticaBold,
    });
    
    page.drawText(formatCurrency(totalAmount), {
      x: colPositions[3] + 5,
      y: currentY,
      size: textSize + 2,
      font: helveticaBold,
    });
    
    // Add footer
    const footerY = margin + 30;
    
    page.drawText('Thank you for your business!', {
      x: margin,
      y: footerY,
      size: textSize,
      font: helveticaBold,
      color: rgb(0.03, 0.52, 0.91),
    });
    
    page.drawText(`Generated on ${new Date().toLocaleDateString()}`, {
      x: width - margin - 200,
      y: footerY,
      size: 8,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();
    
    // Now in a real implementation we would save this PDF to a storage service
    // For demo purposes we're simulating this part
    
    // Generate a unique document ID for the PDF
    const documentId = `pdf-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'PDF generated successfully',
      documentId,
    });
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message,
    });
  }
}
