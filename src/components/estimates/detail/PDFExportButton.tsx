import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import usePdfGeneration from '../hooks/usePdfGeneration';

interface PDFExportButtonProps {
  estimateId: string;
  revisionId?: string;
  revisionVersion?: number;
  viewType?: 'internal' | 'external';
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
  revisionVersion,
  viewType = 'internal',
  contentRef,
  onSuccess,
  className = '',
  variant = 'default',
  size = 'default',
  children,
}) => {
  const { toast } = useToast();
  const { generatePdf, generateClientSidePdf, checkRevisionPdf, isGenerating, error } =
    usePdfGeneration({
      onSuccess,
      onError: error => {
        toast({
          title: 'Error',
          description: error.message || 'An error occurred while generating the PDF',
          variant: 'destructive',
        });
      },
    });

  const handleGeneratePdf = async () => {
    try {
      if (revisionId) {
        const existingPdfId = await checkRevisionPdf(revisionId);
        if (existingPdfId) {
          toast({
            title: 'Regenerating PDF',
            description: `Creating a new ${viewType} PDF version for this revision`,
          });
        }
        await generatePdf(estimateId, revisionId, viewType);
      } else if (contentRef && contentRef.current) {
        await generateClientSidePdf(contentRef);
      } else {
        toast({
          title: 'Missing Parameters',
          description: 'Revision ID or content ref required',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error in PDF export:', error);
      toast({
        title: 'PDF Generation Failed',
        description: error.message || 'Unexpected error',
        variant: 'destructive',
      });
    }
  };

  // Show error message if there was an issue with PDF generation
  React.useEffect(() => {
    if (error) {
      toast({
        title: 'PDF Generation Error',
        description: error.message || 'Failed to generate PDF',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Determine button text dynamically
  let buttonText = children || 'Generate PDF';
  let generatingText = children || 'Generating...';
  let retryText = children || 'Retry PDF';

  if (!children) {
    if (viewType === 'external') {
      buttonText = revisionVersion ? `Customer PDF (V${revisionVersion})` : 'Customer PDF';
      generatingText = `Generating Customer PDF...`;
      retryText = `Retry Customer PDF`;
    } else {
      buttonText = revisionVersion ? `Internal PDF (V${revisionVersion})` : 'Internal PDF';
      generatingText = `Generating Internal PDF...`;
      retryText = `Retry Internal PDF`;
    }
  }

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
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {generatingText}
        </>
      ) : error ? (
        <>
          <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
          {retryText}
        </>
      ) : (
        <>
          <FileText className="h-4 w-4 mr-2" />
          {buttonText}
        </>
      )}
    </Button>
  );
};

export default PDFExportButton;
