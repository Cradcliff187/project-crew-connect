
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, FileText, Upload, Loader2 } from 'lucide-react';
import { Document } from './schemas/documentSchema';
import DocumentPreviewCard, { DocumentCardSkeleton } from './DocumentPreviewCard';
import DocumentDetailView from './DocumentDetailView';
import EnhancedDocumentUpload from './EnhancedDocumentUpload';
import DeleteConfirmation from './DeleteConfirmation';
import DocumentMetricsCard from './DocumentMetricsCard';
import { getEntityDocuments, deleteDocument, forceDeleteDocument } from '@/utils/documentManager';
import { toast } from '@/hooks/use-toast';
import { EntityType } from './schemas/documentSchema';
import { useIsMobile } from '@/hooks/use-mobile';

interface DocumentsSectionProps {
  entityType: EntityType;
  entityId: string;
  title?: string;
  description?: string;
  showMetrics?: boolean;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  entityType,
  entityId,
  title = 'Documents',
  description,
  showMetrics = true
}) => {
  const isMobile = useIsMobile();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [hasReferences, setHasReferences] = useState(false);
  
  // Fetch documents
  const fetchDocuments = async () => {
    setLoading(true);
    const docs = await getEntityDocuments(entityType, entityId);
    setDocuments(docs);
    setLoading(false);
  };
  
  // Load documents on component mount
  useEffect(() => {
    if (entityId) {
      fetchDocuments();
    }
  }, [entityId, entityType]);
  
  // Handle view document
  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowDetailDialog(true);
  };
  
  // Handle delete document
  const handleDeleteDocument = (document: Document) => {
    setSelectedDocument(document);
    setDeleteError(null);
    setHasReferences(false);
    setShowDeleteDialog(true);
  };
  
  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedDocument) return;
    
    const result = await deleteDocument(selectedDocument.document_id || '');
    
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
      setShowDeleteDialog(false);
      fetchDocuments();
    } else {
      setDeleteError(result.message || 'Failed to delete document');
      setHasReferences(!!result.hasReferences);
    }
  };
  
  // Force delete (even with references)
  const confirmForceDelete = async () => {
    if (!selectedDocument) return;
    
    const result = await forceDeleteDocument(selectedDocument.document_id || '');
    
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Document and all references deleted successfully',
      });
      setShowDeleteDialog(false);
      fetchDocuments();
    } else {
      setDeleteError(result.message || 'Failed to force delete document');
    }
  };
  
  // Handle upload success
  const handleUploadSuccess = () => {
    setShowUploadDialog(false);
    fetchDocuments();
    toast({
      title: 'Success',
      description: 'Document uploaded successfully',
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
        <Button 
          onClick={() => setShowUploadDialog(true)}
          className="bg-[#0485ea] hover:bg-[#0375d1]"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>
      
      {showMetrics && (
        <div className="mb-6">
          <DocumentMetricsCard entityType={entityType} entityId={entityId} />
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <DocumentCardSkeleton key={i} />
          ))
        ) : documents.length === 0 ? (
          // No documents state
          <Card className="col-span-full">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <FileText className="h-12 w-12 text-muted-foreground opacity-40 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Documents</h3>
              <p className="text-muted-foreground mb-4">
                There are no documents associated with this {entityType.toLowerCase().replace('_', ' ')}.
              </p>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload First Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Document cards
          documents.map((doc) => (
            <DocumentPreviewCard 
              key={doc.document_id} 
              document={doc} 
              onView={handleViewDocument}
              onDelete={handleDeleteDocument}
            />
          ))
        )}
      </div>
      
      {/* Document Detail Dialog */}
      <DocumentDetailView 
        document={selectedDocument}
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        onDelete={handleDeleteDocument}
        onViewRelatedDocument={(document) => {
          setShowDetailDialog(false);
          // Small timeout to ensure the dialog properly closes before opening new one
          setTimeout(() => {
            setSelectedDocument(document);
            setShowDetailDialog(true);
          }, 100);
        }}
      />
      
      {/* Document Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className={isMobile ? "w-[95vw] max-w-[600px]" : "sm:max-w-[600px]"}>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <EnhancedDocumentUpload 
            entityType={entityType}
            entityId={entityId}
            onSuccess={handleUploadSuccess}
            onCancel={() => setShowUploadDialog(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation 
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        onForceDelete={confirmForceDelete}
        error={deleteError}
        hasReferences={hasReferences}
      />
    </div>
  );
};

export default DocumentsSection;
