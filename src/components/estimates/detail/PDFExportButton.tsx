
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2, Upload } from 'lucide-react';
import { generateEstimatePDF, uploadRevisionPDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

interface PDFExportButtonProps {
  estimateId: string;
  clientName: string;
  projectName: string;
  date: string;
  contentRef: React.RefObject<HTMLDivElement>;
  revisionId?: string;
  revisionNumber?: number;
  autoUpload?: boolean;
  onPdfGenerated?: (documentId: string) => void;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm';
}

const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  estimateId,
  clientName,
  projectName,
  date,
  contentRef,
  revisionId,
  revisionNumber,
  autoUpload = false,
  onPdfGenerated,
  variant = 'outline',
  size = 'sm'
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleExportPDF = async () => {
    if (!contentRef.current) {
      toast({
        title: "Error generating PDF",
        description: "Could not find content to export",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Clone the element to avoid modifying the visible DOM
      const elementToExport = contentRef.current.cloneNode(true) as HTMLElement;
      
      // Temporarily append to document but hide it
      elementToExport.style.position = 'absolute';
      elementToExport.style.left = '-9999px';
      elementToExport.style.overflow = 'visible';  // Ensure everything renders
      elementToExport.style.height = 'auto';
      document.body.appendChild(elementToExport);
      
      // Generate the PDF
      const { blob } = await generateEstimatePDF(
        elementToExport,
        {
          id: estimateId,
          client: clientName,
          project: projectName,
          date: date,
          revision: revisionNumber
        }
      );
      
      // Remove the cloned element
      document.body.removeChild(elementToExport);
      
      if (!blob) {
        throw new Error('Failed to generate PDF blob');
      }
      
      // If autoUpload and we have a revisionId, upload the PDF to storage
      // and link it to the revision
      if (autoUpload && revisionId && revisionNumber !== undefined) {
        const documentId = await uploadRevisionPDF(
          blob,
          estimateId,
          revisionId,
          revisionNumber,
          clientName
        );
        
        if (documentId) {
          if (onPdfGenerated) {
            onPdfGenerated(documentId);
          }
          
          toast({
            title: "PDF Generated and Saved",
            description: "Your estimate has been exported to PDF and saved",
            className: "bg-[#0485ea] text-white"
          });
        } else {
          // Create object URL and trigger download if upload failed
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `Estimate_${estimateId}${revisionNumber ? `_Rev${revisionNumber}` : ''}.pdf`;
          link.click();
          URL.revokeObjectURL(blobUrl);
          
          toast({
            title: "PDF Generated",
            description: "PDF was downloaded but couldn't be saved to storage",
            variant: "destructive"  // Changed from "warning" to "destructive" to match allowed variants
          });
        }
      } else {
        // Create object URL and trigger download
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `Estimate_${estimateId}${revisionNumber ? `_Rev${revisionNumber}` : ''}.pdf`;
        link.click();
        URL.revokeObjectURL(blobUrl);
        
        toast({
          title: "PDF Generated",
          description: "Your estimate has been exported to PDF",
          className: "bg-[#0485ea] text-white"
        });
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      toast({
        title: "Error generating PDF",
        description: "There was a problem creating your PDF",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={handleExportPDF}
      variant={variant}
      size={size}
      disabled={isGenerating}
      className="flex items-center gap-1"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : autoUpload ? (
        <>
          <Upload className="h-4 w-4" />
          Generate & Save PDF
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4" />
          Export PDF
        </>
      )}
    </Button>
  );
};

export default PDFExportButton;
