
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, RefreshCw, Printer, Loader2, Eye } from 'lucide-react';
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
  const [estimateData, setEstimateData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (revisionId) {
      checkForPdf();
      fetchEstimateData();
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

  const fetchEstimateData = async () => {
    try {
      // Fetch estimate data
      const { data: estimate, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('estimateid', estimateId)
        .single();
      
      if (estimateError) throw estimateError;
      
      // Fetch revision data
      const { data: revision, error: revisionError } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('id', revisionId)
        .single();
      
      if (revisionError) throw revisionError;
      
      setEstimateData({
        ...estimate,
        revision: revision
      });
    } catch (error) {
      console.error('Error fetching estimate data:', error);
    }
  };

  const handlePdfGenerated = (newDocumentId: string) => {
    setDocumentId(newDocumentId);
    setHasPdf(true);
    toast({
      title: "PDF Generated",
      description: "The PDF has been generated successfully",
      className: "bg-[#0485ea] text-white",
    });
    checkForPdf(); // Refresh to ensure consistency
  };

  const handleDownload = () => {
    toast({
      title: "Downloading PDF",
      description: "Your PDF is being downloaded",
      className: "bg-[#0485ea] text-white",
    });
  };

  return (
    <Card className="mb-4 shadow-sm border-muted/60">
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
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={checkForPdf}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download PDF
                </Button>
              </div>
            ) : (
              <PDFExportButton
                estimateId={estimateId}
                revisionId={revisionId}
                onSuccess={handlePdfGenerated}
                variant="default"
                size="sm"
                className="bg-[#0485ea] hover:bg-[#0373ce]"
                clientName={estimateData?.customername || "Client"}
                projectName={estimateData?.projectname || "Project"}
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
            onDownload={handleDownload}
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
              clientName={estimateData?.customername || "Client"}
              projectName={estimateData?.projectname || "Project"}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimatePDFManager;
