import React, { useState, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { EntityType } from '@/components/documents/schemas/documentSchema';
import DocumentCard from '../../workOrders/details/DocumentsList/DocumentCard';
import DocumentViewer from '../../workOrders/details/DocumentsList/DocumentViewer';

export interface BaseDocument {
  document_id: string;
  file_name: string;
  category?: string;
  created_at: string;
  updated_at: string;
  file_type: string;
  storage_path: string;
  entity_id: string;
  entity_type: string;
  url: string; // Changed from optional to required
  file_size?: number; // Added to match WorkOrderDocument
}

interface DocumentsSectionProps {
  documents: BaseDocument[];
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
    const [viewDocument, setViewDocument] = useState<BaseDocument | null>(null);

    const handleViewDocument = (doc: BaseDocument) => {
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
            <CardTitle className="text-lg font-montserrat text-[#0485ea]">Documents</CardTitle>
            <Button
              variant="outline"
              className="text-[#0485ea] border-[#0485ea] hover:bg-[#0485ea]/10"
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
                  document={doc as any} // We'll cast to any here as a temporary fix
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
                className="mt-4 text-[#0485ea] border-[#0485ea] hover:bg-[#0485ea]/10"
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
            </DialogHeader>
            <EnhancedDocumentUpload
              entityType={entityType}
              entityId={entityId}
              onSuccess={handleUploadSuccess}
              onCancel={() => setIsUploadOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={!!viewDocument} onOpenChange={open => !open && setViewDocument(null)}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{viewDocument?.file_name}</DialogTitle>
            </DialogHeader>
            {viewDocument && (
              <DocumentViewer
                document={viewDocument as any} // We'll cast to any here as a temporary fix
                open={!!viewDocument}
                onOpenChange={open => !open && setViewDocument(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </Card>
    );
  }
);

DocumentsSection.displayName = 'DocumentsSection';

export default DocumentsSection;
