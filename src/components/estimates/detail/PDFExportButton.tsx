
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import usePdfGeneration from '../hooks/usePdfGeneration';

interface PDFExportButtonProps {
  estimateId: string;
  revisionId: string;
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
  onSuccess,
  className,
  variant = 'default',
  size = 'default'
}) => {
  const { generatePdf, isGenerating } = usePdfGeneration();

  const handleGeneratePdf = async () => {
    try {
      const documentId = await generatePdf(estimateId, revisionId);
      if (documentId && onSuccess) {
        onSuccess(documentId);
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
