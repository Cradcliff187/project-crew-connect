
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { EntityType } from '@/components/documents/schemas/documentSchema';
import DocumentViewer from './DocumentViewer';
import { useWorkOrderDocuments } from './useWorkOrderDocuments';
import { WorkOrderDocument } from './types';
import DocumentsTableContent from './DocumentsTableContent';
import { Skeleton } from '@/components/ui/skeleton';

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
      
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <DocumentsTableContent
          documents={documents}
          loading={loading}
          onViewDocument={handleViewDocument}
          onToggleUploadForm={toggleUploadForm}
        />
      )}
      
      <DocumentViewer 
        document={viewDocument}
        open={!!viewDocument}
        onOpenChange={(open) => !open && handleCloseViewer()}
      />
    </div>
  );
};

export default WorkOrderDocumentsList;
