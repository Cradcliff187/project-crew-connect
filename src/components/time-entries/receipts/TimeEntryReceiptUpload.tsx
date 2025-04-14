import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileText, GridIcon, ListIcon, Download, ViewIcon, Trash2 } from 'lucide-react';
import { Document } from '@/components/documents/schemas/documentSchema';
import StandardizedDocumentUpload from '@/components/documents/StandardizedDocumentUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import DocumentViewerDialog from '@/components/documents/DocumentViewerDialog';
import DocumentsGrid from '@/components/documents/DocumentsGrid';
import DocumentsDataTable from '@/components/documents/DocumentsDataTable';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import DocumentDeleteDialog from '@/components/documents/DocumentDeleteDialog';
import { useToast } from '@/hooks/use-toast';
import useBreakpoint from '@/hooks/use-breakpoint';

interface TimeEntryReceiptUploadProps {
  timeEntryId: string;
  employeeName?: string;
  amount?: number;
  date?: string;
  onReceiptAdded?: () => void;
  compact?: boolean;
}

const TimeEntryReceiptUpload: React.FC<TimeEntryReceiptUploadProps> = ({
  timeEntryId,
  employeeName = 'Employee',
  amount,
  date,
  onReceiptAdded,
  compact = false,
}) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewType, setViewType] = useState<'grid' | 'list'>(compact ? 'list' : 'grid');
  const { isAboveMd } = useBreakpoint('md');
  const { toast } = useToast();

  // Format date for display
  const formatDate = date ? new Date(date).toLocaleDateString() : 'N/A';

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', 'TIME_ENTRY')
        .eq('entity_id', timeEntryId)
        .eq('category', 'receipt')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include document URLs
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
      console.error('Error in time entry receipts fetch:', err);
      toast({
        title: 'Error',
        description: 'Failed to load time entry receipts.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [timeEntryId, toast]);

  // Load documents on component mount
  useEffect(() => {
    if (timeEntryId) {
      fetchDocuments();
    }
  }, [timeEntryId, fetchDocuments]);

  const handleDocumentUploaded = () => {
    setUploadDialogOpen(false);
    fetchDocuments();
    if (onReceiptAdded) {
      onReceiptAdded();
    }
    toast({
      title: 'Receipt Uploaded',
      description: 'The receipt has been successfully uploaded.',
    });
  };

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
      title: 'Receipt Deleted',
      description: 'The receipt has been successfully deleted.',
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

  // Render compact mode
  if (compact) {
    return (
      <>
        <div className="mt-2">
          {documents.length > 0 ? (
            <div className="flex flex-col space-y-2">
              {documents.map(doc => (
                <Button
                  key={doc.document_id}
                  variant="outline"
                  size="sm"
                  className="flex justify-between w-full text-left"
                  onClick={() => handleViewDocument(doc)}
                >
                  <span className="truncate flex-1">{doc.file_name}</span>
                  <span className="text-xs text-muted-foreground">View</span>
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUploadDialogOpen(true)}
                className="text-[#0485ea]"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Another Receipt
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploadDialogOpen(true)}
              className="w-full"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Receipt
            </Button>
          )}
        </div>

        {/* Document Viewer */}
        <DocumentViewerDialog
          document={selectedDocument}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />

        {/* Receipt Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <DialogHeader>
              <DialogTitle>Upload Receipt</DialogTitle>
              <DialogDescription>
                Upload a receipt for expenses related to this time entry.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-grow pr-1 -mr-1">
              <StandardizedDocumentUpload
                entityType="TIME_ENTRY"
                entityId={timeEntryId}
                onSuccess={handleDocumentUploaded}
                onCancel={() => setUploadDialogOpen(false)}
                isReceiptUpload={true}
                prefillData={{
                  notes: `Receipt for ${employeeName} on ${formatDate}`,
                  category: 'receipt',
                  amount: amount,
                  expenseDate: date ? new Date(date) : undefined,
                }}
                preventFormPropagation={true}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Document Delete Dialog */}
        <DocumentDeleteDialog
          document={selectedDocument}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDocumentDeleted={handleDocumentDeleted}
        />
      </>
    );
  }

  // Render full mode
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Time Entry Receipts</h3>
        <div className="flex items-center gap-2">
          {!compact && (
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
          )}
          <Button
            onClick={() => setUploadDialogOpen(true)}
            className="bg-[#0485ea] hover:bg-[#0375d1]"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Receipt
          </Button>
        </div>
      </div>

      {viewType === 'grid' ? (
        <DocumentsGrid
          documents={documents}
          isLoading={loading}
          emptyMessage="No receipts uploaded"
          emptyDescription="Upload receipts to document expenses for this time entry."
          getActions={getDocumentActions}
          onDocumentClick={handleViewDocument}
        />
      ) : (
        <DocumentsDataTable
          documents={documents}
          isLoading={loading}
          getActions={getDocumentActions}
          emptyMessage="No receipts uploaded"
        />
      )}

      {/* Receipt Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Upload Receipt</DialogTitle>
            <DialogDescription>
              Upload a receipt for expenses related to this time entry.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-grow pr-1 -mr-1">
            <StandardizedDocumentUpload
              entityType="TIME_ENTRY"
              entityId={timeEntryId}
              onSuccess={handleDocumentUploaded}
              onCancel={() => setUploadDialogOpen(false)}
              isReceiptUpload={true}
              prefillData={{
                notes: `Receipt for ${employeeName} on ${formatDate}`,
                category: 'receipt',
                amount: amount,
                expenseDate: date ? new Date(date) : undefined,
              }}
              preventFormPropagation={true}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Viewer */}
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
};

export default TimeEntryReceiptUpload;
