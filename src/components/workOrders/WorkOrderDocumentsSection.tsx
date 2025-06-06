import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Document } from '@/components/documents/schemas/documentSchema';
import DocumentsGrid from '@/components/documents/DocumentsGrid';
import DocumentsDataTable from '@/components/documents/DocumentsDataTable';
import DocumentViewToggle, { DocumentViewType } from '@/components/documents/DocumentViewToggle';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useDocumentViewer } from '@/hooks/useDocumentViewer';
import DocumentViewer from '@/components/documents/DocumentViewer';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface WorkOrderDocumentsSectionProps {
  workOrderId: string;
  workOrderTitle?: string;
}

export default function WorkOrderDocumentsSection({
  workOrderId,
  workOrderTitle = 'Work Order',
}: WorkOrderDocumentsSectionProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewType, setViewType] = useState<DocumentViewType>('grid');
  const { viewDocument, closeViewer, isViewerOpen, currentDocument } = useDocumentViewer();

  useEffect(() => {
    fetchDocuments();
  }, [workOrderId]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', 'WORK_ORDER')
        .eq('entity_id', workOrderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments((data as Document[]) || []);
    } catch (error: any) {
      console.error('Error fetching work order documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load work order documents',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDocument = (document: Document) => {
    viewDocument(document.document_id || '');
  };

  const handleDeleteDocument = async (document: Document) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', document.document_id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });

      fetchDocuments();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const getDocumentActions = (document: Document) => [
    {
      icon: <Plus className="h-4 w-4" />,
      label: 'View',
      onClick: () => handleViewDocument(document),
    },
    {
      icon: <Plus className="h-4 w-4" />,
      label: 'Delete',
      onClick: () => handleDeleteDocument(document),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium font-montserrat">Work Order Documents</h3>
        <div className="flex items-center gap-2">
          <DocumentViewToggle viewType={viewType} onViewTypeChange={setViewType} />
          <Button
            onClick={() => setUploadOpen(true)}
            className="bg-[#0485ea] hover:bg-[#0375d1] font-opensans"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Document
          </Button>
        </div>
      </div>

      {viewType === 'grid' ? (
        <DocumentsGrid
          documents={documents}
          isLoading={isLoading}
          emptyMessage="No work order documents found"
          emptyDescription="Upload documents for this work order such as photos, receipts or reports."
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-montserrat">Upload Work Order Document</DialogTitle>
            <DialogDescription>
              Upload documents related to this work order such as invoices, receipts, or
              specifications.
            </DialogDescription>
          </DialogHeader>
          <EnhancedDocumentUpload
            entityType="WORK_ORDER"
            entityId={workOrderId}
            onSuccess={() => {
              setUploadOpen(false);
              fetchDocuments();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Document Viewer */}
      {currentDocument && (
        <DocumentViewer
          document={currentDocument}
          open={isViewerOpen}
          onOpenChange={open => !open && closeViewer()}
        />
      )}
    </div>
  );
}
