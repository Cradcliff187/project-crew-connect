
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
  children?: React.ReactNode;
}

const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  estimateId,
  revisionId,
  contentRef,
  onSuccess,
  className = "",
  variant = 'default',
  size = 'default',
  children
}) => {
  const { toast } = useToast();
  const { generatePdf, checkRevisionPdf, isGenerating } = usePdfGeneration({
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
      // Check if we're using a revision ID
      if (revisionId) {
        // Check if PDF already exists
        const existingPdfId = await checkRevisionPdf(revisionId);
        
        if (existingPdfId) {
          // If PDF exists and we're regenerating, inform the user
          toast({
            title: "Regenerating PDF",
            description: "Creating a new PDF version for this revision",
          });
        }
        
        await generatePdf(estimateId, revisionId);
      } else if (contentRef && contentRef.current) {
        toast({
          title: "Info",
          description: "Content-based PDF generation is in development",
          variant: "default"
        });
      } else {
        toast({
          title: "Missing Parameters",
          description: "Either a revision ID or content reference is required",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error in PDF export:', error);
    }
  };

  const buttonText = children || (
    <>
      <FileText className="mr-2 h-4 w-4" />
      {isGenerating ? "Generating PDF..." : "Export PDF"}
    </>
  );

  return (
    <Button
      onClick={handleGeneratePdf}
      disabled={isGenerating}
      variant={variant}
      size={size}
      className={`${className} ${variant === 'default' ? 'bg-[#0485ea] hover:bg-[#0373d1] text-white' : ''}`}
    >
      {isGenerating && !children ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating PDF...
        </>
      ) : buttonText}
    </Button>
  );
};

export default PDFExportButton;
