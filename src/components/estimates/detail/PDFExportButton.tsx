
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { generateEstimatePDF } from '@/utils/pdfGenerator';
import { toast } from '@/hooks/use-toast';

interface PDFExportButtonProps {
  estimateId: string;
  clientName: string;
  projectName: string;
  date: string;
  contentRef: React.RefObject<HTMLDivElement>;
}

const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  estimateId,
  clientName,
  projectName,
  date,
  contentRef
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

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
      await generateEstimatePDF(
        elementToExport,
        {
          id: estimateId,
          client: clientName,
          project: projectName,
          date: date
        }
      );
      
      // Remove the cloned element
      document.body.removeChild(elementToExport);
      
      toast({
        title: "PDF Generated",
        description: "Your estimate has been exported to PDF",
        className: "bg-[#0485ea] text-white"
      });
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
      variant="outline"
      size="sm"
      disabled={isGenerating}
      className="flex items-center gap-1"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
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
