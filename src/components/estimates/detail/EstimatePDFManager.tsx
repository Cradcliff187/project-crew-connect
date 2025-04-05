
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, Loader2, FileText, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PDFExportButton from './PDFExportButton';
import DocumentShareDialog from './dialogs/DocumentShareDialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface EstimatePDFManagerProps {
  estimateId: string;
  revisionId: string;
  clientEmail?: string;
}

const EstimatePDFManager: React.FC<EstimatePDFManagerProps> = ({ 
  estimateId,
  revisionId,
  clientEmail
}) => {
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (revisionId) {
      fetchPdfDocument();
    }
  }, [revisionId]);
  
  const fetchPdfDocument = async () => {
    setIsLoading(true);
    try {
      const { data: revision, error: revisionError } = await supabase
        .from('estimate_revisions')
        .select('pdf_document_id')
        .eq('id', revisionId)
        .single();
        
      if (revisionError) throw revisionError;
      
      if (revision?.pdf_document_id) {
        const { data: document, error: docError } = await supabase
          .from('documents_with_urls')
          .select('*')
          .eq('document_id', revision.pdf_document_id)
          .single();
          
        if (docError) throw docError;
        
        setPdfDocument(document || null);
        setLastUpdated(new Date());
      } else {
        setPdfDocument(null);
      }
    } catch (error) {
      console.error('Error fetching PDF document:', error);
      toast({
        title: 'Error',
        description: 'Could not load the PDF document',
        variant: 'destructive',
      });
      setPdfDocument(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePdfGenerated = (documentId: string) => {
    toast({
      title: 'PDF Generated',
      description: 'PDF has been generated successfully.',
      className: 'bg-[#0485ea] text-white',
    });
    fetchPdfDocument();
  };
  
  const handleDownload = async () => {
    if (!pdfDocument?.url) {
      toast({
        title: 'Error',
        description: 'PDF URL not available for download.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const response = await fetch(pdfDocument.url);
      const blob = await response.blob();
      
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = pdfDocument.file_name || `estimate-${estimateId}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Log the download action
      await supabase
        .from('document_access_logs')
        .insert({
          document_id: pdfDocument.document_id,
          action: 'DOWNLOAD'
        });
        
      toast({
        title: 'Downloaded',
        description: 'PDF downloaded successfully',
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Download Error',
        description: 'Failed to download the PDF.',
        variant: 'destructive'
      });
    }
  };
  
  const handleShare = () => {
    setShareDialogOpen(true);
  };

  const handleRefresh = () => {
    fetchPdfDocument();
    toast({
      title: 'Refreshing',
      description: 'Checking for the latest PDF document',
    });
  };

  return (
    <Card className="border-[#0485ea]/20">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-start space-x-3">
            <FileText className="h-8 w-8 text-[#0485ea] mt-1" />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold">Estimate PDF Document</h3>
                {pdfDocument && (
                  <Badge variant="outline" className="text-[#0485ea] border-[#0485ea] bg-[#0485ea]/10">
                    Ready
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {pdfDocument ? 
                  'PDF document is available for download and sharing' : 
                  'Generate a PDF document of this estimate'
                }
              </p>
              {lastUpdated && pdfDocument && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {lastUpdated.toLocaleString()}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {isLoading ? (
              <Button disabled className="bg-[#0485ea] text-white">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </Button>
            ) : pdfDocument ? (
              <>
                <Button onClick={handleDownload} className="bg-[#0485ea] text-white hover:bg-[#0373d1]">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button variant="ghost" size="icon" onClick={handleRefresh} title="Refresh PDF status">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <PDFExportButton
                  estimateId={estimateId}
                  revisionId={revisionId}
                  variant="outline"
                  onSuccess={handlePdfGenerated}
                >
                  Regenerate PDF
                </PDFExportButton>
              </>
            ) : (
              <>
                <PDFExportButton
                  estimateId={estimateId}
                  revisionId={revisionId}
                  onSuccess={handlePdfGenerated}
                  className="bg-[#0485ea] text-white hover:bg-[#0373d1]"
                />
                <Button variant="ghost" size="icon" onClick={handleRefresh} title="Refresh PDF status">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        
        {!pdfDocument && !isLoading && (
          <Alert className="mt-4 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertTitle>No PDF Document</AlertTitle>
            <AlertDescription>
              This estimate revision doesn't have a PDF document yet. Generate a PDF to enable downloading and sharing.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <DocumentShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        document={pdfDocument}
        estimateId={estimateId}
        clientEmail={clientEmail}
      />
    </Card>
  );
};

export default EstimatePDFManager;
