
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Printer, RefreshCw, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PDFEstimateViewerProps {
  estimateId: string;
  revisionId: string;
  onDownload?: () => void;
}

const PDFEstimateViewer: React.FC<PDFEstimateViewerProps> = ({
  estimateId,
  revisionId,
  onDownload
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (revisionId) {
      fetchPdfDocument();
    }
  }, [revisionId]);

  const fetchPdfDocument = async () => {
    setIsLoading(true);
    try {
      // Get the revision with the PDF document ID
      const { data: revision, error: revisionError } = await supabase
        .from('estimate_revisions')
        .select('pdf_document_id')
        .eq('id', revisionId)
        .single();

      if (revisionError) throw revisionError;
      
      if (!revision.pdf_document_id) {
        setPdfUrl(null);
        return;
      }

      // Get the document details with URL from the view
      const { data: document, error: documentError } = await supabase
        .from('documents_with_urls')
        .select('*')
        .eq('document_id', revision.pdf_document_id)
        .single();

      if (documentError) throw documentError;

      if (!document || !document.url) {
        // Fallback to getting the storage path and creating a signed URL
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .select('storage_path')
          .eq('document_id', revision.pdf_document_id)
          .single();
        
        if (docError) throw docError;
        
        if (!docData.storage_path) {
          throw new Error('Document storage path not found');
        }
        
        // Get a signed URL for the document
        const { data: signedUrlData, error: signedUrlError } = await supabase
          .storage
          .from('construction_documents')
          .createSignedUrl(docData.storage_path, 3600); // 1 hour expiry
        
        if (signedUrlError) throw signedUrlError;
        
        setPdfUrl(signedUrlData.signedUrl);
      } else {
        setPdfUrl(document.url);
      }
    } catch (error) {
      console.error('Error fetching PDF:', error);
      toast({
        title: 'Error',
        description: 'Could not load the PDF document',
        variant: 'destructive',
      });
      setPdfUrl(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPdfDocument();
  };

  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    }
  };

  const handleDownloadClick = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `Estimate-${estimateId}-Revision-${revisionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (onDownload) {
        onDownload();
      }
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-none">
      <div className="bg-slate-100 p-2 flex justify-between items-center rounded-t-md">
        <div>
          <h3 className="text-sm font-medium">Estimate Preview</h3>
        </div>
        <div className="flex items-center space-x-2">
          {isRefreshing ? (
            <Button variant="ghost" size="sm" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handlePrint} disabled={!pdfUrl}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownloadClick} disabled={!pdfUrl}>
            <Download className="h-4 w-4" />
          </Button>
          {pdfUrl && (
            <Button variant="ghost" size="sm" asChild>
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center p-16 bg-slate-50 border-t">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : pdfUrl ? (
          <iframe 
            src={pdfUrl} 
            className="w-full h-[600px] border-0"
            title="Estimate PDF Preview"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-16 bg-slate-50 border-t space-y-2">
            <p className="text-muted-foreground text-center">No PDF document available for this estimate revision</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PDFEstimateViewer;
