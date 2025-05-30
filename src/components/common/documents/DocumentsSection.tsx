import React, { useState, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { EntityType } from '@/components/documents/schemas/documentSchema';
import DocumentCard from './DocumentCard';
import DocumentViewerDialog from '@/components/documents/DocumentViewerDialog';
import { Database } from '@/integrations/supabase/types';

type DocumentRow = Database['public']['Tables']['documents']['Row'];

interface DocumentsSectionProps {
  documents: DocumentRow[];
  loading: boolean;
  entityId: string;
  entityType: EntityType;
  onUploadSuccess: () => void;
  emptyStateMessage?: string;
}

const DocumentsSection = memo(
  ({
    documents,
    loading,
    entityId,
    entityType,
    onUploadSuccess,
    emptyStateMessage = 'No documents have been attached',
  }: DocumentsSectionProps) => {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [viewDocument, setViewDocument] = useState<DocumentRow | null>(null);

    const handleViewDocument = (doc: DocumentRow) => {
      setViewDocument(doc);
    };

    const handleUploadSuccess = () => {
      setIsUploadOpen(false);
      onUploadSuccess();
    };

    return (
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-montserrat text-primary">Documents</CardTitle>
            <Button
              variant="outline"
              className="text-primary border-primary hover:bg-primary/10"
              onClick={() => setIsUploadOpen(true)}
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload Document
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-24 animate-pulse bg-gray-100 rounded-md"></div>
              ))}
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map(doc => (
                <DocumentCard
                  key={doc.document_id}
                  document={doc}
                  onViewDocument={() => handleViewDocument(doc)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md">
              <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-muted-foreground">{emptyStateMessage}</p>
              <Button
                variant="outline"
                className="mt-4 text-primary border-primary hover:bg-primary/10"
                onClick={() => setIsUploadOpen(true)}
              >
                <Upload className="h-4 w-4 mr-1" />
                Add Document
              </Button>
            </div>
          )}
        </CardContent>

        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload and categorize your document for this{' '}
                {entityType.toLowerCase().replace('_', ' ')}.
              </DialogDescription>
            </DialogHeader>
            <EnhancedDocumentUpload
              entityType={entityType}
              entityId={entityId}
              onSuccess={handleUploadSuccess}
              onCancel={() => setIsUploadOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <DocumentViewerDialog
          document={viewDocument}
          open={!!viewDocument}
          onOpenChange={open => !open && setViewDocument(null)}
        />
      </Card>
    );
  }
);

DocumentsSection.displayName = 'DocumentsSection';

export default DocumentsSection;
