import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Eye, Trash2 } from 'lucide-react';
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

interface ProjectDocumentsSectionProps {
  projectId: string;
  projectName?: string;
}

export default function ProjectDocumentsSection({
  projectId,
  projectName = 'Project',
}: ProjectDocumentsSectionProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewType, setViewType] = useState<DocumentViewType>('grid');
  const { viewDocument, closeViewer, isViewerOpen, currentDocument } = useDocumentViewer();

  useEffect(() => {
    fetchDocuments();
  }, [projectId]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', 'PROJECT')
        .eq('entity_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments((data as Document[]) || []);
    } catch (error: any) {
      console.error('Error fetching project documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project documents',
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
      icon: <Eye className="h-4 w-4" />,
      label: 'View',
      onClick: () => handleViewDocument(document),
    },
    {
      icon: <Trash2 className="h-4 w-4" />,
      label: 'Delete',
      onClick: () => handleDeleteDocument(document),
    },
  ];

  return (
    <>
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-montserrat flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Project Documents
              </CardTitle>
              {documents.length > 0 && (
                <Badge variant="secondary" className="font-opensans">
                  {documents.length}
                </Badge>
              )}
            </div>
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
        </CardHeader>
        <CardContent>
          {viewType === 'grid' ? (
            <DocumentsGrid
              documents={documents}
              isLoading={isLoading}
              emptyMessage="No project documents found"
              emptyDescription="Upload documents for this project such as photos, contracts or specifications."
              getActions={getDocumentActions}
              onDocumentClick={handleViewDocument}
            />
          ) : (
            <DocumentsDataTable
              documents={documents}
              isLoading={isLoading}
              getActions={getDocumentActions}
              emptyMessage="No project documents found"
            />
          )}
        </CardContent>
      </Card>

      {/* Document Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-montserrat">Upload Project Document</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Select and upload documents for this project. Supported formats include images, PDFs,
              and office documents.
            </DialogDescription>
          </DialogHeader>
          <EnhancedDocumentUpload
            entityType="PROJECT"
            entityId={projectId}
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
    </>
  );
}
