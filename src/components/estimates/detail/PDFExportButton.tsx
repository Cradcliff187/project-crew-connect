
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

  const handleGeneratePdf = async () => {
    try {
      // Use the revisionId if available, otherwise generate PDF with content reference
      if (revisionId) {
        const documentId = await generatePdf(estimateId, revisionId);
        if (documentId && onSuccess) {
          onSuccess(documentId);
        }
      } else if (contentRef && contentRef.current) {
        // Handle alternative PDF generation method if needed
        console.log("Content-based PDF generation not implemented yet");
      }
    } catch (error) {
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
