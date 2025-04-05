
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, RefreshCw, Printer, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PDFExportButton from './PDFExportButton';
import PDFEstimateViewer from './PDFEstimateViewer';

interface EstimatePDFManagerProps {
  estimateId: string;
  revisionId: string;
}

const EstimatePDFManager: React.FC<EstimatePDFManagerProps> = ({ estimateId, revisionId }) => {
  const [hasPdf, setHasPdf] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (revisionId) {
      checkForPdf();
    }
  }, [revisionId]);

  const checkForPdf = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('estimate_revisions')
        .select('pdf_document_id')
        .eq('id', revisionId)
        .single();

      if (error) throw error;

      if (data && data.pdf_document_id) {
        setHasPdf(true);
        setDocumentId(data.pdf_document_id);
      } else {
        setHasPdf(false);
        setDocumentId(null);
      }
    } catch (error) {
      console.error('Error checking for PDF:', error);
      setHasPdf(false);
      setDocumentId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfGenerated = (newDocumentId: string) => {
    setDocumentId(newDocumentId);
    setHasPdf(true);
    checkForPdf(); // Refresh to ensure consistency
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#0485ea]" />
            Estimate Document
          </span>
          <div>
            {isLoading ? (
              <Button variant="outline" disabled>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Loading...
              </Button>
            ) : hasPdf ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkForPdf}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh PDF
              </Button>
            ) : (
              <PDFExportButton
                estimateId={estimateId}
                revisionId={revisionId}
                onSuccess={handlePdfGenerated}
                variant="default"
                size="sm"
                className="bg-[#0485ea] hover:bg-[#0373ce]"
              />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="flex items-center justify-center p-16 bg-slate-50 border rounded-md">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : hasPdf ? (
          <PDFEstimateViewer 
            estimateId={estimateId} 
            revisionId={revisionId} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-16 bg-slate-50 border rounded-md">
            <FileText className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              No PDF has been generated for this estimate revision yet
            </p>
            <PDFExportButton
              estimateId={estimateId}
              revisionId={revisionId}
              onSuccess={handlePdfGenerated}
              variant="default"
              className="bg-[#0485ea] hover:bg-[#0373ce]"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimatePDFManager;
