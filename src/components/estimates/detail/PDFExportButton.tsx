
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2, Upload, Save } from 'lucide-react';
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
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'secondary' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
  text?: string;
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
  size = 'sm',
  className = '',
  showIcon = true,
  showText = true,
  text
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
            variant: "destructive"
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

  // Determine which icon to show
  const IconComponent = isGenerating ? 
    Loader2 : 
    autoUpload ? 
      Save : 
      FileDown;

  // Determine display text
  const displayText = isGenerating ? 
    'Generating...' : 
    text ? 
      text : 
      autoUpload ? 
        'Save PDF' : 
        'Export PDF';

  return (
    <Button 
      onClick={handleExportPDF}
      variant={variant}
      size={size}
      disabled={isGenerating}
      className={`${className}`}
    >
      {showIcon && (
        <IconComponent className={`h-4 w-4 ${showText ? 'mr-2' : ''} ${isGenerating ? 'animate-spin' : ''}`} />
      )}
      {showText && displayText}
    </Button>
  );
};

export default PDFExportButton;
