
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, FileDown, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EstimateRevision } from '../types/estimateTypes';
import DocumentViewerDialog from '@/components/documents/DocumentViewerDialog';

interface RevisionPDFViewerProps {
  revision: EstimateRevision;
  showCard?: boolean;
}

const RevisionPDFViewer: React.FC<RevisionPDFViewerProps> = ({ 
  revision,
  showCard = true
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [document, setDocument] = useState<any>(null);
  
  const hasPdf = !!revision.pdf_document_id;

  const handleViewPdf = async () => {
    if (!revision.pdf_document_id) return;
    
    setIsLoading(true);
    
    try {
      // Fetch the document details with URL
      const { data, error } = await supabase
        .from('documents_with_urls')
        .select('*')
        .eq('document_id', revision.pdf_document_id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setDocument(data);
        setViewerOpen(true);
      }
    } catch (err) {
      console.error('Error fetching document:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!revision.pdf_document_id) return;
    
    setIsLoading(true);
    
    try {
      // Fetch the document details with URL
      const { data, error } = await supabase
        .from('documents_with_urls')
        .select('url, file_name')
        .eq('document_id', revision.pdf_document_id)
        .single();
      
      if (error) throw error;
      
      if (data?.url) {
        // Create a temporary anchor and click it
        const link = document.createElement('a');
        link.href = data.url;
        link.download = data.file_name || `Estimate_Revision_${revision.version}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Error downloading document:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasPdf) return null;

  const content = (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
          onClick={handleViewPdf}
          disabled={isLoading || !hasPdf}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          View PDF
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
          onClick={handleDownloadPdf}
          disabled={isLoading || !hasPdf}
        >
          <FileDown className="h-4 w-4" />
          Download
        </Button>
      </div>
      {document && (
        <DocumentViewerDialog
          document={document}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          title={`Estimate Revision ${revision.version}`}
          description="PDF for this estimate revision"
        />
      )}
    </div>
  );

  if (!showCard) return content;

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-sm font-medium flex items-center">
          <FileDown className="h-4 w-4 mr-1.5" />
          Revision PDF
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export default RevisionPDFViewer;
