import { useState, useCallback } from 'react';
import useBreakpoint from '@/hooks/use-breakpoint';
import { Plus, GridIcon, ListIcon, Download, ViewIcon, Trash2 } from 'lucide-react';
import { Document } from '@/components/documents/schemas/documentSchema';
import DocumentsDataTable from '@/components/documents/DocumentsDataTable';
import DocumentsGrid from '@/components/documents/DocumentsGrid';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import StandardizedDocumentUpload from '@/components/documents/StandardizedDocumentUpload';
import DocumentViewerDialog from '@/components/documents/DocumentViewerDialog';
import DocumentDeleteDialog from '@/components/documents/DocumentDeleteDialog';
import { useToast } from '@/hooks/use-toast';
import { useEstimateDocuments } from '@/components/documents/hooks/useEstimateDocuments';

interface EstimateDocumentsSectionProps {
  estimateId: string;
  estimateName?: string;
}

export default function EstimateDocumentsSection({
  estimateId,
  estimateName = 'Estimate',
}: EstimateDocumentsSectionProps) {
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const { isAboveMd } = useBreakpoint('md');
  const { toast } = useToast();

  const { documents, loading: isLoading, refetchDocuments } = useEstimateDocuments(estimateId);

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setViewerOpen(true);
  };

  const handleDownloadDocument = async (document: Document) => {
    if (document.url) {
      window.open(document.url, '_blank');
    } else {
      toast({
        title: 'Error',
        description: 'Document URL not available.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (document: Document) => {
    setSelectedDocument(document);
    setDeleteDialogOpen(true);
  };

  const handleDocumentDeleted = async () => {
    setDeleteDialogOpen(false);
    refetchDocuments();
    toast({
      title: 'Document Deleted',
      description: 'The document has been successfully deleted.',
    });
  };

  const handleDocumentUploaded = () => {
    setUploadOpen(false);
    refetchDocuments();
    toast({
      title: 'Document Uploaded',
      description: 'The document has been successfully uploaded.',
    });
  };

  const getDocumentActions = useCallback(
    (document: Document) => [
      {
        icon: <ViewIcon className="h-4 w-4" />,
        label: 'View',
        onClick: () => handleViewDocument(document),
      },
      {
        icon: <Download className="h-4 w-4" />,
        label: 'Download',
        onClick: () => handleDownloadDocument(document),
      },
      {
        icon: <Trash2 className="h-4 w-4" />,
        label: 'Delete',
        onClick: () => handleDeleteClick(document),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Estimate Documents</h3>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={viewType}
            onValueChange={v => v && setViewType(v as 'grid' | 'list')}
          >
            <ToggleGroupItem value="grid" aria-label="Grid View">
              <GridIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List View">
              <ListIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button onClick={() => setUploadOpen(true)} className="bg-[#0485ea] hover:bg-[#0375d1]">
            <Plus className="h-4 w-4 mr-1" />
            Add Document
          </Button>
        </div>
      </div>

      {viewType === 'grid' ? (
        <DocumentsGrid
          documents={documents}
          isLoading={isLoading}
          emptyMessage="No estimate documents found"
          emptyDescription="Upload documents for this estimate such as quotes, proposals, or specifications."
          getActions={getDocumentActions}
          onDocumentClick={handleViewDocument}
        />
      ) : (
        <DocumentsDataTable
          documents={documents}
          isLoading={isLoading}
          getActions={getDocumentActions}
          emptyMessage="No estimate documents found"
        />
      )}

      {/* Document Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Upload Estimate Document</DialogTitle>
            <DialogDescription>
              Upload documents related to {estimateName} such as quotes, proposals, or
              specifications.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-grow pr-1 -mr-1">
            <StandardizedDocumentUpload
              entityType="ESTIMATE"
              entityId={estimateId}
              onSuccess={handleDocumentUploaded}
              onCancel={() => setUploadOpen(false)}
              prefillData={{
                notes: `Document for ${estimateName}`,
              }}
              preventFormPropagation={true}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Dialog */}
      <DocumentViewerDialog
        document={selectedDocument}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
      />

      {/* Document Delete Dialog */}
      <DocumentDeleteDialog
        document={selectedDocument}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDocumentDeleted={handleDocumentDeleted}
      />
    </div>
  );
}
