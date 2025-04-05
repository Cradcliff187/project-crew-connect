
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Share2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PDFExportButton from './PDFExportButton';
import DocumentShareDialog from './dialogs/DocumentShareDialog';

interface EstimatePDFManagerProps {
  estimateId: string;
  revisionId: string;
}

const EstimatePDFManager: React.FC<EstimatePDFManagerProps> = ({ 
  estimateId,
  revisionId
}) => {
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
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
      } else {
        setPdfDocument(null);
      }
    } catch (error) {
      console.error('Error fetching PDF document:', error);
      setPdfDocument(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePdfGenerated = (documentId: string) => {
    toast({
      title: 'PDF Generated',
      description: 'PDF has been generated successfully.',
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

  return (
    <Card>
      <CardContent className="p-5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Estimate PDF Document</h3>
          <p className="text-sm text-muted-foreground">
            {pdfDocument ? 
              'PDF document is available for download and sharing' : 
              'Generate a PDF document of this estimate'
            }
          </p>
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
              <PDFExportButton
                estimateId={estimateId}
                revisionId={revisionId}
                variant="outline"
                onSuccess={handlePdfGenerated}
              >
                <FileText className="mr-2 h-4 w-4" />
                Regenerate
              </PDFExportButton>
            </>
          ) : (
            <PDFExportButton
              estimateId={estimateId}
              revisionId={revisionId}
              onSuccess={handlePdfGenerated}
              className="bg-[#0485ea] text-white hover:bg-[#0373d1]"
            />
          )}
        </div>
      </CardContent>
      
      <DocumentShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        document={pdfDocument}
        estimateId={estimateId}
      />
    </Card>
  );
};

export default EstimatePDFManager;
