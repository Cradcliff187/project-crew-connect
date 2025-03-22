
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import DocumentsGrid from './DocumentsGrid';
import DocumentViewer from './DocumentViewer';
import { useWorkOrderDocuments } from './useWorkOrderDocuments';
import { WorkOrderDocument } from './types';
import DocumentsHeader from './DocumentsHeader';
import UploadSection from './UploadSection';

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
      <DocumentsHeader 
        showUploadForm={showUploadForm} 
        toggleUploadForm={toggleUploadForm} 
      />
      
      <CardContent>
        {showUploadForm && (
          <UploadSection 
            workOrderId={workOrderId}
            onSuccess={handleUploadSuccess}
            onCancel={() => setShowUploadForm(false)}
          />
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
