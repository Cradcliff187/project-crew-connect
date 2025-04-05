
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Download, Loader2 } from 'lucide-react';
import { EstimateRevision } from '../types/estimateTypes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface RevisionPDFViewerProps {
  revision: EstimateRevision;
  showCard?: boolean;
}

const RevisionPDFViewer: React.FC<RevisionPDFViewerProps> = ({ 
  revision,
  showCard = true 
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPdfUrl();
  }, [revision]);

  const handleViewPdf = () => {
    if (pdfUrl) {
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
      downloadLink.download = `Estimate-V${revision.version}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
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
      <div>
        <h4 className="text-sm font-medium mb-1">PDF Document</h4>
        <p className="text-xs text-muted-foreground">Version {revision.version} PDF Document</p>
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
      <Card className="mt-2">
        <CardContent className="p-4">
          {content}
        </CardContent>
      </Card>
    );
  }

  return <div className="mt-4 p-3 border rounded-md bg-slate-50">{content}</div>;
};

export default RevisionPDFViewer;
