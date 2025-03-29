
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, FileText } from 'lucide-react';
import { useState } from 'react';
import DocumentUpload from '@/components/documents/DocumentUpload';
import DocumentsTableContent from '../details/DocumentsList/DocumentsTableContent';
import { useWorkOrderDocumentsEmbed } from './useWorkOrderDocumentsEmbed';
import { WorkOrderDocument } from '../details/DocumentsList/types';
import DocumentVersionHistoryCard from '@/components/documents/DocumentVersionHistoryCard';

interface WorkOrderDocumentsProps {
  workOrderId: string;
  entityType: string;
}

const WorkOrderDocuments = ({ workOrderId, entityType }: WorkOrderDocumentsProps) => {
  const { documents, loading, refetchDocuments } = useWorkOrderDocumentsEmbed(workOrderId, entityType);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<WorkOrderDocument | null>(null);
  
  const handleUploadComplete = () => {
    refetchDocuments();
    setShowUpload(false);
  };
  
  const handleViewDocument = (document: WorkOrderDocument) => {
    setSelectedDocument(document);
    window.open(document.url, '_blank');
  };

  // Find documents with the same parent_document_id as the selected document
  const documentVersions = selectedDocument 
    ? documents.filter(doc => 
        doc.parent_document_id === selectedDocument.parent_document_id || 
        doc.document_id === selectedDocument.parent_document_id ||
        doc.document_id === selectedDocument.document_id
      )
    : [];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-[#0485ea]/10 p-4 rounded-md">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#0485ea]" />
          <h3 className="text-base font-medium">Work Order Documents</h3>
        </div>
        <Button 
          onClick={() => setShowUpload(true)}
          className="bg-[#0485ea] hover:bg-[#0375d1]"
          size="sm"
        >
          <FileUp className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card className="shadow-sm border-[#0485ea]/10">
            <CardContent className="p-0">
              <DocumentsTableContent 
                documents={documents} 
                loading={loading} 
                onViewDocument={(doc) => {
                  handleViewDocument(doc);
                  setSelectedDocument(doc);
                }}
                onToggleUploadForm={() => setShowUpload(true)}
              />
            </CardContent>
          </Card>
        </div>
        
        {selectedDocument && documentVersions.length > 0 && (
          <div className="md:col-span-1">
            <DocumentVersionHistoryCard 
              documents={documentVersions}
              currentVersion={selectedDocument.version || 1}
              onVersionSelect={handleViewDocument}
            />
          </div>
        )}
      </div>
      
      {showUpload && (
        <DocumentUpload
          projectId={workOrderId}
          onSuccess={handleUploadComplete}
          onCancel={() => setShowUpload(false)}
        />
      )}
    </div>
  );
};

export default WorkOrderDocuments;
