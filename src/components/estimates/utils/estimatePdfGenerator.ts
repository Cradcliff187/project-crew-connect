
import { jsPDF } from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

// Types for the PDF generator
interface EstimateData {
  estimateId: string;
  revisionId: string;
  customerName: string;
  projectName: string;
  revisionNumber: number;
  estimateDate: string;
  items: EstimateItem[];
  totalAmount: number;
  siteLocation?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  notes?: string;
  contingencyAmount?: number;
}

interface EstimateItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export const generateEstimatePdf = async (data: EstimateData): Promise<Blob> => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set document properties
  doc.setProperties({
    title: `Estimate ${data.estimateId} - Revision ${data.revisionNumber}`,
    subject: `Estimate for ${data.customerName}`,
    author: 'AKC LLC',
    creator: 'AKC LLC Estimate System'
  });

  // Add company logo and header
  doc.setFontSize(20);
  doc.setTextColor(8, 133, 234); // Brand blue color
  doc.text('AKC LLC', 20, 20);
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Professional Construction Services', 20, 26);

  // Add estimate information
  doc.setFontSize(14);
  doc.setTextColor(8, 133, 234);
  doc.text(`ESTIMATE: ${data.estimateId}`, doc.internal.pageSize.width - 80, 20);
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Revision: ${data.revisionNumber}`, doc.internal.pageSize.width - 80, 26);
  doc.text(`Date: ${data.estimateDate}`, doc.internal.pageSize.width - 80, 32);

  // Add client information
  doc.setFontSize(11);
  doc.text('CLIENT', 20, 40);
  doc.setFontSize(10);
  doc.text(data.customerName, 20, 46);
  
  if (data.siteLocation) {
    // Add project location
    doc.setFontSize(11);
    doc.text('PROJECT LOCATION', 20, 60);
    doc.setFontSize(10);
    if (data.siteLocation.address) 
      doc.text(data.siteLocation.address, 20, 66);
    
    let locationLine = '';
    if (data.siteLocation.city) locationLine += data.siteLocation.city;
    if (data.siteLocation.state) {
      if (locationLine) locationLine += ', ';
      locationLine += data.siteLocation.state;
    }
    if (data.siteLocation.zip) {
      if (locationLine) locationLine += ' ';
      locationLine += data.siteLocation.zip;
    }
    
    if (locationLine) doc.text(locationLine, 20, 72);
  }

  // Add project name
  doc.setFontSize(12);
  doc.setTextColor(8, 133, 234);
  doc.text(`PROJECT: ${data.projectName || 'Unnamed Project'}`, 20, 86);
  doc.setTextColor(0, 0, 0);

  // Add items table
  const tableStartY = 100;
  const tableHeaders = [['Description', 'Qty', 'Unit Price', 'Total']];
  
  const tableData = data.items.map(item => [
    item.description,
    item.quantity.toString(),
    `$${item.unitPrice.toFixed(2)}`,
    `$${item.totalPrice.toFixed(2)}`
  ]);

  const tableColumnWidths = [100, 20, 30, 30];
  
  (doc as any).autoTable({
    startY: tableStartY,
    head: tableHeaders,
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [8, 133, 234],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: tableColumnWidths[0] },
      1: { cellWidth: tableColumnWidths[1], halign: 'right' },
      2: { cellWidth: tableColumnWidths[2], halign: 'right' },
      3: { cellWidth: tableColumnWidths[3], halign: 'right' }
    }
  });

  // Add total and contingency
  const tableEndY = (doc as any).lastAutoTable.finalY + 10;
  
  if (data.contingencyAmount && data.contingencyAmount > 0) {
    doc.text('Subtotal:', 140, tableEndY);
    doc.text(`$${(data.totalAmount - data.contingencyAmount).toFixed(2)}`, 180, tableEndY, { align: 'right' });
    
    doc.text('Contingency:', 140, tableEndY + 7);
    doc.text(`$${data.contingencyAmount.toFixed(2)}`, 180, tableEndY + 7, { align: 'right' });
    
    doc.setFontSize(12);
    doc.setTextColor(8, 133, 234);
    doc.text('TOTAL:', 140, tableEndY + 15);
    doc.text(`$${data.totalAmount.toFixed(2)}`, 180, tableEndY + 15, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
  } else {
    doc.setFontSize(12);
    doc.setTextColor(8, 133, 234);
    doc.text('TOTAL:', 140, tableEndY);
    doc.text(`$${data.totalAmount.toFixed(2)}`, 180, tableEndY, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
  }

  // Add notes if available
  if (data.notes) {
    const notesY = tableEndY + 30;
    doc.setFontSize(11);
    doc.text('NOTES', 20, notesY);
    doc.setFontSize(10);
    
    const splitNotes = doc.splitTextToSize(data.notes, 170);
    doc.text(splitNotes, 20, notesY + 6);
  }

  // Add footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for your business!', doc.internal.pageSize.width / 2, pageHeight - 20, { align: 'center' });
  doc.text('AKC LLC | Professional Construction Services', doc.internal.pageSize.width / 2, pageHeight - 15, { align: 'center' });

  // Return the PDF as a blob
  return doc.output('blob');
};

// Function to save the PDF to Supabase storage and associate with the estimate revision
export const savePdfToStorage = async (
  blob: Blob,
  estimateId: string,
  revisionId: string
): Promise<string | null> => {
  try {
    const fileName = `${estimateId}/${revisionId}.pdf`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('estimates')
      .upload(fileName, blob, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Create a document entry
    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .insert({
        entity_type: 'ESTIMATE',
        entity_id: estimateId,
        storage_path: uploadData.path,
        file_name: `Estimate-${estimateId}-Rev${revisionId}.pdf`,
        file_type: 'pdf',
        category: 'estimate',
      })
      .select('document_id')
      .single();

    if (documentError) throw documentError;

    // Link the document to the estimate revision
    const { error: revisionError } = await supabase
      .from('estimate_revisions')
      .update({ pdf_document_id: documentData.document_id })
      .eq('id', revisionId);

    if (revisionError) throw revisionError;

    return documentData.document_id;
  } catch (error) {
    console.error('Error saving PDF:', error);
    return null;
  }
};

// Function to generate and save a PDF for an estimate revision
export const generateAndSavePdf = async (estimateId: string, revisionId: string): Promise<string | null> => {
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
    const estimateData: EstimateData = {
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
