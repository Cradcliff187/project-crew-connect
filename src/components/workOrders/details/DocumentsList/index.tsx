
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { EntityType } from '@/components/documents/schemas/documentSchema';
import DocumentsGrid from './DocumentsGrid';
import DocumentViewer from './DocumentViewer';
import { useWorkOrderDocuments } from './useWorkOrderDocuments';
import { WorkOrderDocument } from './types';

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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Documents & Receipts</CardTitle>
          <Button 
            variant="outline" 
            className="text-[#0485ea]"
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
      </CardHeader>
      
      <CardContent>
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
        
        <DocumentsGrid 
          documents={documents}
          loading={loading}
          onViewDocument={handleViewDocument}
          onToggleUploadForm={toggleUploadForm}
        />
      </CardContent>
      
      <DocumentViewer 
        document={viewDocument}
        open={!!viewDocument}
        onOpenChange={(open) => !open && handleCloseViewer()}
      />
    </Card>
  );
};

export default WorkOrderDocumentsList;
