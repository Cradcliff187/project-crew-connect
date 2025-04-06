
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, Loader2, FileText, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PDFExportButton from './PDFExportButton';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';

interface CompactPDFManagerProps {
  estimateId: string;
  revisionId: string;
  clientEmail?: string;
  onOpenShareDialog: () => void;
}

const CompactPDFManager: React.FC<CompactPDFManagerProps> = ({ 
  estimateId,
  revisionId,
  clientEmail,
  onOpenShareDialog
}) => {
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  const handleRefresh = () => {
    fetchPdfDocument();
    toast({
      title: 'Refreshing',
      description: 'Checking for the latest PDF document',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 py-1">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading PDF...</span>
      </div>
    );
  }

  if (!pdfDocument) {
    return (
      <div className="flex items-center justify-between border rounded-md px-3 py-2 bg-amber-50/50 border-amber-200">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">No PDF available</span>
        </div>
        <PDFExportButton
          estimateId={estimateId}
          revisionId={revisionId}
          onSuccess={handlePdfGenerated}
          className="bg-[#0485ea] text-white hover:bg-[#0373d1] text-xs py-1"
          size="sm"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border rounded-md px-3 py-2 bg-blue-50/30 border-blue-100">
      <div className="flex items-center">
        <FileText className="h-4 w-4 text-[#0485ea] mr-2" />
        <div>
          <div className="flex items-center">
            <span className="text-sm font-medium mr-1">PDF Document</span>
            <Badge variant="outline" className="text-[#0485ea] border-[#0485ea] bg-[#0485ea]/10 text-xs">
              Ready
            </Badge>
          </div>
          {lastUpdated && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-xs text-muted-foreground">
                    Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{lastUpdated.toLocaleString()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      <div className="flex gap-1">
        <Button 
          onClick={handleDownload} 
          variant="outline" 
          size="sm" 
          className="h-7 px-2 text-xs"
        >
          <Download className="h-3.5 w-3.5 mr-1" />
          Download
        </Button>
        <Button
          onClick={onOpenShareDialog}
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
        >
          <Share2 className="h-3.5 w-3.5 mr-1" />
          Share
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-7 w-7 p-0" 
          onClick={handleRefresh}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default CompactPDFManager;
