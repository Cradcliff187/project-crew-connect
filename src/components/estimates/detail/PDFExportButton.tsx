
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import usePdfGeneration from '../hooks/usePdfGeneration';

interface PDFExportButtonProps {
  estimateId: string;
  revisionId?: string;
  contentRef?: React.RefObject<HTMLDivElement>;
  onSuccess?: (documentId: string) => void;
  className?: string;
  variant?: 
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | null
    | undefined;
  size?: 'default' | 'sm' | 'lg' | 'icon' | null | undefined;
}

const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  estimateId,
  revisionId,
  contentRef,
  onSuccess,
  className,
  variant = 'default',
  size = 'default'
}) => {
  const { toast } = useToast();
  const { generatePdf, isGenerating } = usePdfGeneration({
    onSuccess,
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while generating the PDF",
        variant: "destructive"
      });
    }
  });

  const handleGeneratePdf = async () => {
    try {
      // Use the revisionId if available, otherwise generate PDF with content reference
      if (revisionId) {
        await generatePdf(estimateId, revisionId);
      } else if (contentRef && contentRef.current) {
        toast({
          title: "Info",
          description: "Content-based PDF generation is in development",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Error in PDF export:', error);
    }
  };

  return (
    <Button
      onClick={handleGeneratePdf}
      disabled={isGenerating}
      variant={variant}
      size={size}
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Export PDF
        </>
      )}
    </Button>
  );
};

export default PDFExportButton;
