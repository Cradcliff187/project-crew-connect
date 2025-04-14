import { useState, useEffect, useCallback } from 'react';
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

interface ReceiptDocumentsSectionProps {
  timeEntryId: string;
  readOnly?: boolean;
}

export default function ReceiptDocumentsSection({
  timeEntryId,
  readOnly = false,
}: ReceiptDocumentsSectionProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      // First get the document IDs linked to this time entry
      const { data: linkData, error: linkError } = await supabase
        .from('time_entry_document_links')
        .select('document_id')
        .eq('time_entry_id', timeEntryId);

      if (linkError) throw linkError;

      if (!linkData || linkData.length === 0) {
        setDocuments([]);
        setIsLoading(false);
        return;
      }

      // Get the documents with their URLs
      const documentIds = linkData.map(link => link.document_id);
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('*')
        .in('document_id', documentIds)
        .order('created_at', { ascending: false });

      if (docError) throw docError;

      // Transform the data to include document URLs
      const docsWithUrls = await Promise.all(
        (docData || []).map(async doc => {
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
      console.error('Error fetching time entry receipts:', err);
      toast({
        title: 'Error',
        description: 'Failed to load receipts.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [timeEntryId, toast]);

  useEffect(() => {
    if (timeEntryId) {
      fetchDocuments();
    }
  }, [timeEntryId, fetchDocuments]);

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

    // First delete the link
    try {
      const { error: linkError } = await supabase
        .from('time_entry_document_links')
        .delete()
        .eq('time_entry_id', timeEntryId)
        .eq('document_id', selectedDocument?.document_id);

      if (linkError) throw linkError;
    } catch (err) {
      console.error('Error deleting document link:', err);
    }

    await fetchDocuments();

    // Update the time entry has_receipts flag if no documents left
    if (documents.length === 0) {
      try {
        await supabase.from('time_entries').update({ has_receipts: false }).eq('id', timeEntryId);
      } catch (err) {
        console.error('Error updating time entry has_receipts flag:', err);
      }
    }

    toast({
      title: 'Receipt Deleted',
      description: 'The receipt has been successfully deleted.',
    });
  };

  const getDocumentActions = (document: Document) => {
    const actions = [
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
    ];

    if (!readOnly) {
      actions.push({
        icon: <Trash2 className="h-4 w-4" />,
        label: 'Delete',
        onClick: () => handleDeleteClick(document),
      });
    }

    return actions;
  };

  // Handle document upload success
  const handleUploadSuccess = async (documentId: string) => {
    // Link document to time entry
    try {
      const { error: linkError } = await supabase.from('time_entry_document_links').insert({
        time_entry_id: timeEntryId,
        document_id: documentId,
        created_at: new Date().toISOString(),
      });

      if (linkError) throw linkError;

      // Update the time entry has_receipts flag
      await supabase.from('time_entries').update({ has_receipts: true }).eq('id', timeEntryId);

      setUploadOpen(false);
      fetchDocuments();

      toast({
        title: 'Receipt Uploaded',
        description: 'Your receipt has been successfully uploaded.',
      });
    } catch (err) {
      console.error('Error linking document to time entry:', err);
      toast({
        title: 'Error',
        description: 'Failed to link receipt to time entry.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Receipts</h3>
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
          {!readOnly && (
            <Button onClick={() => setUploadOpen(true)} className="bg-[#0485ea] hover:bg-[#0375d1]">
              <Plus className="h-4 w-4 mr-1" />
              Add Receipt
            </Button>
          )}
        </div>
      </div>

      {viewType === 'grid' ? (
        <DocumentsGrid
          documents={documents}
          isLoading={isLoading}
          emptyMessage="No receipts found"
          getActions={getDocumentActions}
          onDocumentClick={handleViewDocument}
        />
      ) : (
        <DocumentsDataTable
          documents={documents}
          isLoading={isLoading}
          getActions={getDocumentActions}
          emptyMessage="No receipts found"
        />
      )}

      {/* Receipt Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Upload Receipt</DialogTitle>
            <DialogDescription>
              Upload receipts for expenses related to this time entry.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-grow pr-1 -mr-1">
            <StandardizedDocumentUpload
              entityType="TIME_ENTRY"
              entityId={timeEntryId}
              onSuccess={handleUploadSuccess}
              onCancel={() => setUploadOpen(false)}
              prefillData={{
                category: 'receipt',
                tags: ['receipt', 'time-entry'],
                is_expense: true,
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
