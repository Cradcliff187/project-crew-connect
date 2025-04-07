import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Download, Loader2, FileText } from 'lucide-react';
import { EstimateRevision } from '../types/estimateTypes';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RevisionPDFViewerProps {
  revision: EstimateRevision;
  showCard?: boolean;
  className?: string;
}

const RevisionPDFViewer: React.FC<RevisionPDFViewerProps> = ({ 
  revision,
  showCard = true,
  className = ""
}) => {
  
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadPdfUrl = async () => {
      if (!revision?.pdf_document_id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('documents_with_urls')
          .select('url, file_name')
          .eq('document_id', revision.pdf_document_id)
          .single();
          
        if (error) throw error;
        
        if (data?.url) {
          setPdfUrl(data.url);
          setFileName(data.file_name || `Estimate-V${revision.version}.pdf`);
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPdfUrl();
  }, [revision]);
  
  const handleViewPdf = async () => {
    if (pdfUrl) {
      // Log the view action
      try {
        await supabase
          .from('document_access_logs')
          .insert({
            document_id: revision.pdf_document_id,
            action: 'VIEW'
          });
      } catch (error) {
        console.error('Error logging document view:', error);
      }
      
      // Open the PDF in a new window
      window.open(pdfUrl, '_blank');
    } else {
      toast({
        title: 'PDF Not Available',
        description: 'The PDF document could not be loaded.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadPdf = async () => {
    if (!pdfUrl) {
      toast({
        title: 'PDF Not Available',
        description: 'The PDF document could not be loaded for download.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      
      // Create a download link
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = fileName || `Estimate-V${revision.version}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Log the download action
      try {
        await supabase
          .from('document_access_logs')
          .insert({
            document_id: revision.pdf_document_id,
            action: 'DOWNLOAD'
          });
      } catch (error) {
        console.error('Error logging document download:', error);
      }
    } catch (err) {
      console.error('Error downloading PDF:', err);
      toast({
        title: 'Download Failed',
        description: 'There was an error downloading the PDF.',
        variant: 'destructive',
      });
    }
  };

  if (!revision?.pdf_document_id) {
    return null;
  }
  
  const content = (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div className="flex items-center space-x-2">
        <FileText className="h-4 w-4 text-[#0485ea]" />
        <div>
          <h4 className="text-sm font-medium">PDF Document</h4>
          <p className="text-xs text-muted-foreground">Version {revision.version} PDF Document</p>
        </div>
      </div>
      <div className="flex gap-2">
        {isLoading ? (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="text-xs"
          >
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            Loading
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewPdf}
              disabled={!pdfUrl}
              className="text-xs"
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={!pdfUrl}
              className="text-xs bg-[#0485ea] text-white hover:bg-[#0373d1]"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Download
            </Button>
          </>
        )}
      </div>
    </div>
  );

  if (showCard) {
    return (
      <Card className={`mt-2 ${className}`}>
        <CardContent className="p-4">
          {content}
        </CardContent>
      </Card>
    );
  }

  return <div className={`mt-4 p-3 border rounded-md bg-slate-50 ${className}`}>{content}</div>;
};

export default RevisionPDFViewer;
