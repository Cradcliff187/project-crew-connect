
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import usePdfGeneration from '../hooks/usePdfGeneration';

interface PDFExportButtonProps {
  estimateId: string;
  revisionId?: string;
  clientName?: string;
  projectName?: string;
  date?: string;
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
  clientName,
  projectName,
  date,
  contentRef,
  onSuccess,
  className,
  variant = 'default',
  size = 'default'
}) => {
  const { generatePdf, isGenerating } = usePdfGeneration();
  const { toast } = useToast();

  const handleGeneratePdf = async () => {
    try {
      // Use the revisionId if available, otherwise generate PDF with content reference
      if (revisionId) {
        const documentId = await generatePdf(estimateId, revisionId);
        if (documentId && onSuccess) {
          onSuccess(documentId);
        } else if (!documentId) {
          toast({
            title: "Error",
            description: "Failed to generate PDF. Please try again.",
            variant: "destructive"
          });
        }
      } else if (contentRef && contentRef.current) {
        toast({
          title: "Info",
          description: "Content-based PDF generation is in development",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Error in PDF export:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while generating the PDF",
        variant: "destructive"
      });
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
