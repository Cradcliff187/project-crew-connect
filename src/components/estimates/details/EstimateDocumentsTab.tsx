
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Share2 } from 'lucide-react';
import { Document } from '@/components/documents/schemas/documentSchema';
import DocumentUpload from '@/components/documents/DocumentUpload';
import { useEstimateDocuments } from '@/components/documents/hooks/useEstimateDocuments';
import DocumentViewerDialog from '@/components/documents/DocumentViewerDialog';
import DocumentShareDialog from '@/components/estimates/detail/dialogs/DocumentShareDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EntityType } from '@/components/documents/schemas/documentSchema';

interface EstimateDocumentsTabProps {
  estimateId: string;
  onShareDocument?: (document: Document) => void;
}

const EstimateDocumentsTab: React.FC<EstimateDocumentsTabProps> = ({ 
  estimateId,
  onShareDocument
}) => {
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [viewerDialogOpen, setViewerDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const { documents, loading, error, refetchDocuments } = useEstimateDocuments(estimateId);

  React.useEffect(() => {
    if (estimateId) {
      refetchDocuments();
    }
  }, [estimateId, refetchDocuments]);

  const handleUploadComplete = () => {
    refetchDocuments();
    setUploadDialogOpen(false);
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setViewerDialogOpen(true);
  };

  const handleShareDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setShareDialogOpen(true);
    if (onShareDocument) {
      onShareDocument(doc);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getFileIcon = (fileType: string) => {
    // Return different icons based on file type
    return <FileText className="h-10 w-10 text-gray-400" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Estimate Documents</h3>
        <Button onClick={() => setUploadDialogOpen(true)} size="sm" className="bg-[#0485ea]">
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-6">Loading documents...</div>
      ) : error ? (
        <div className="text-center py-6 text-red-500">
          Error loading documents: {error}
        </div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <FileText className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Documents Yet</h3>
            <p className="text-gray-500 max-w-md">
              Upload documents related to this estimate, such as specifications, contracts, or references.
            </p>
            <Button
              onClick={() => setUploadDialogOpen(true)}
              variant="outline"
              className="mt-4"
            >
              Upload Your First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card key={doc.document_id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    {getFileIcon(doc.file_type || '')}
                    <div className="ml-3 truncate flex-1">
                      <h4 className="font-medium truncate" title={doc.file_name}>
                        {doc.file_name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : ''}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Uploaded: {formatDate(doc.created_at || '')}
                  </p>
                  {doc.notes && (
                    <p className="text-sm text-gray-600 truncate">{doc.notes}</p>
                  )}
                </div>
                <div className="border-t p-3 flex justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleViewDocument(doc)}
                    className="text-[#0485ea]"
                  >
                    View
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleShareDocument(doc)}
                    className="text-[#0485ea]"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Document Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <DocumentUpload
            entityType={"ESTIMATE" as EntityType}
            entityId={estimateId}
            onSuccess={handleUploadComplete}
            onCancel={() => setUploadDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Document Viewer Dialog */}
      {selectedDocument && (
        <DocumentViewerDialog
          document={selectedDocument}
          open={viewerDialogOpen}
          onOpenChange={setViewerDialogOpen}
          title={selectedDocument.file_name}
        />
      )}

      {/* Document Share Dialog */}
      {selectedDocument && (
        <DocumentShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          document={selectedDocument}
          estimateId={estimateId}
        />
      )}
    </div>
  );
};

export default EstimateDocumentsTab;
