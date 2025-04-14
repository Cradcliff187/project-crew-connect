import { useState, useEffect, useCallback } from 'react';
import useBreakpoint from '@/hooks/use-breakpoint';
import { Plus, GridIcon, ListIcon, Download, ViewIcon, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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

interface WorkOrderDocumentsSectionProps {
  workOrderId: string;
  workOrderTitle?: string;
  allowReceiptUpload?: boolean;
}

export default function WorkOrderDocumentsSection({
  workOrderId,
  workOrderTitle = 'Work Order',
  allowReceiptUpload = true,
}: WorkOrderDocumentsSectionProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [receiptUploadOpen, setReceiptUploadOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const { isAboveMd } = useBreakpoint('md');
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', 'WORK_ORDER')
        .eq('entity_id', workOrderId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data
      const docsWithUrls = await Promise.all(
        (data || []).map(async doc => {
          let publicUrl = '';

          try {
            const { data: urlData } = supabase.storage
              .from('construction_documents')
              .getPublicUrl(doc.storage_path);

            publicUrl = urlData.publicUrl;
          } catch (err) {
            console.error('Error getting public URL:', err);
          }

          return {
            ...doc,
            url: publicUrl,
            file_url: publicUrl,
            is_latest_version: doc.is_latest_version ?? true,
            mime_type: doc.file_type || 'application/octet-stream',
          } as Document;
        })
      );

      setDocuments(docsWithUrls);
    } catch (err) {
      console.error('Error fetching work order documents:', err);
      toast({
        title: 'Error',
        description: 'Failed to load work order documents.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [workOrderId, toast]);

  useEffect(() => {
    if (workOrderId) {
      fetchDocuments();
    }
  }, [workOrderId, fetchDocuments]);

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
    await fetchDocuments();
    toast({
      title: 'Document Deleted',
      description: 'The document has been successfully deleted.',
    });
  };

  const handleDocumentUploaded = () => {
    setUploadOpen(false);
    setReceiptUploadOpen(false);
    fetchDocuments();
    toast({
      title: 'Document Uploaded',
      description: 'The document has been successfully uploaded.',
    });
  };

  const getDocumentActions = (document: Document) => [
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
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Work Order Documents</h3>
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
          <div className="flex gap-2">
            {allowReceiptUpload && (
              <Button
                onClick={() => setReceiptUploadOpen(true)}
                variant="outline"
                className="hidden sm:flex"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Receipt
              </Button>
            )}
            <Button onClick={() => setUploadOpen(true)} className="bg-[#0485ea] hover:bg-[#0375d1]">
              <Plus className="h-4 w-4 mr-1" />
              Add Document
            </Button>
          </div>
        </div>
      </div>

      {viewType === 'grid' ? (
        <DocumentsGrid
          documents={documents}
          isLoading={isLoading}
          emptyMessage="No work order documents found"
          emptyDescription="Upload documents for this work order such as photos, receipts or contracts."
          getActions={getDocumentActions}
          onDocumentClick={handleViewDocument}
        />
      ) : (
        <DocumentsDataTable
          documents={documents}
          isLoading={isLoading}
          getActions={getDocumentActions}
          emptyMessage="No work order documents found"
        />
      )}

      {/* Document Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Upload Work Order Document</DialogTitle>
            <DialogDescription>
              Upload documents related to {workOrderTitle} such as photos, receipts, or contracts.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-grow pr-1 -mr-1">
            <StandardizedDocumentUpload
              entityType="WORK_ORDER"
              entityId={workOrderId}
              onSuccess={handleDocumentUploaded}
              onCancel={() => setUploadOpen(false)}
              prefillData={{
                notes: `Document for ${workOrderTitle}`,
              }}
              preventFormPropagation={true}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Upload Dialog */}
      <Dialog open={receiptUploadOpen} onOpenChange={setReceiptUploadOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Upload Receipt</DialogTitle>
            <DialogDescription>
              Upload a receipt for expenses related to this work order.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-grow pr-1 -mr-1">
            <StandardizedDocumentUpload
              entityType="WORK_ORDER"
              entityId={workOrderId}
              onSuccess={handleDocumentUploaded}
              onCancel={() => setReceiptUploadOpen(false)}
              isReceiptUpload={true}
              prefillData={{
                notes: `Receipt for ${workOrderTitle}`,
                category: 'receipt',
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
