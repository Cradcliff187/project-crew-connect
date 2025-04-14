import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, ExternalLink } from 'lucide-react';
import { EstimateRevision } from '../types/estimateTypes';
import { supabase } from '@/integrations/supabase/client';

interface RevisionPDFViewerProps {
  revision: EstimateRevision;
}

const RevisionPDFViewer = ({ revision }: RevisionPDFViewerProps) => {
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!revision.pdf_document_id) return;

    const fetchPdfInfo = async () => {
      try {
        // Get document info
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .select('file_name, storage_path')
          .eq('document_id', revision.pdf_document_id)
          .single();

        if (docError) throw docError;
        if (!docData) return;

        setFileName(docData.file_name);

        // Get document URL
        const { data: urlData, error: urlError } = await supabase.storage
          .from('documents')
          .createSignedUrl(docData.storage_path, 3600); // 1 hour expiry

        if (urlError) throw urlError;
        setPdfUrl(urlData.signedUrl);
      } catch (error) {
        console.error('Error fetching PDF:', error);
      }
    };

    fetchPdfInfo();
  }, [revision.pdf_document_id]);

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName || `Estimate-Revision-${revision.version}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  if (!revision.pdf_document_id) return null;

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">PDF Document</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={!pdfUrl}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleOpenInNewTab} disabled={!pdfUrl}>
              <ExternalLink className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>
        </div>

        <div className="bg-gray-100 border rounded-md p-3 text-sm">
          {pdfUrl ? (
            <div className="flex items-center">
              <span className="truncate">
                {fileName || `Estimate Revision ${revision.version} PDF`}
              </span>
            </div>
          ) : (
            <div className="text-muted-foreground">Loading PDF information...</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RevisionPDFViewer;
