
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { EntityType } from '@/components/documents/schemas/documentSchema';
import DocumentViewer from './DocumentViewer';
import { useWorkOrderDocuments } from './useWorkOrderDocuments';
import { WorkOrderDocument } from './types';
import DocumentsTableContent from './DocumentsTableContent';
import { Skeleton } from '@/components/ui/skeleton';
import DocumentVersionHistoryCard from '@/components/documents/DocumentVersionHistoryCard';

interface WorkOrderDocumentsListProps {
  workOrderId: string;
}

const WorkOrderDocumentsList = ({ workOrderId }: WorkOrderDocumentsListProps) => {
  const { documents, loading, fetchDocuments } = useWorkOrderDocuments(workOrderId);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [viewDocument, setViewDocument] = useState<WorkOrderDocument | null>(null);
  
  // Toggle document upload form
  const toggleUploadForm = () => {
    setShowUploadForm(!showUploadForm);
  };

  // Handle successful document upload
  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    fetchDocuments();
  };
  
  // Handle view document
  const handleViewDocument = (doc: WorkOrderDocument) => {
    setViewDocument(doc);
  };
  
  // Close document viewer
  const handleCloseViewer = () => {
    setViewDocument(null);
  };

  // Find documents with the same parent_document_id as the selected document
  const documentVersions = viewDocument 
    ? documents.filter(doc => 
        (viewDocument.parent_document_id && doc.parent_document_id === viewDocument.parent_document_id) || 
        (viewDocument.parent_document_id && doc.document_id === viewDocument.parent_document_id) ||
        (doc.parent_document_id && doc.parent_document_id === viewDocument.document_id) ||
        doc.document_id === viewDocument.document_id
      )
    : [];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Documents & Receipts</h3>
        <Button 
          variant={showUploadForm ? "outline" : "default"}
          className={showUploadForm 
            ? "text-[#0485ea] border-[#0485ea]/30 hover:bg-blue-50" 
            : "bg-[#0485ea] hover:bg-[#0375d1]"}
          onClick={toggleUploadForm}
        >
          {showUploadForm ? (
            <>
              <X className="h-4 w-4 mr-1" />
              Cancel Upload
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-1" />
              Upload Document
            </>
          )}
        </Button>
      </div>
      
      {showUploadForm && (
        <div className="mb-6">
          <EnhancedDocumentUpload 
            entityType={"WORK_ORDER" as EntityType}
            entityId={workOrderId}
            onSuccess={handleUploadSuccess}
            onCancel={() => setShowUploadForm(false)}
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <DocumentsTableContent
                  documents={documents}
                  loading={loading}
                  onViewDocument={handleViewDocument}
                  onToggleUploadForm={toggleUploadForm}
                />
              </CardContent>
            </Card>
          )}
        </div>
        
        {viewDocument && documentVersions.length > 0 && (
          <div className="md:col-span-1">
            <DocumentVersionHistoryCard 
              documents={documentVersions}
              currentVersion={viewDocument.version || 1}
              onVersionSelect={handleViewDocument}
            />
          </div>
        )}
      </div>
      
      <DocumentViewer 
        document={viewDocument}
        open={!!viewDocument}
        onOpenChange={(open) => !open && handleCloseViewer()}
      />
    </div>
  );
};

export default WorkOrderDocumentsList;
