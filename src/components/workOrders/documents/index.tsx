
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, FileText } from 'lucide-react';
import { useState } from 'react';
import DocumentUpload from '@/components/documents/DocumentUpload';
import DocumentsTableContent from '../details/DocumentsList/DocumentsTableContent';
import { useWorkOrderDocumentsEmbed } from './useWorkOrderDocumentsEmbed';

interface WorkOrderDocumentsProps {
  workOrderId: string;
  entityType: string;
}

const WorkOrderDocuments = ({ workOrderId, entityType }: WorkOrderDocumentsProps) => {
  const { documents, loading, refetchDocuments } = useWorkOrderDocumentsEmbed(workOrderId, entityType);
  const [showUpload, setShowUpload] = useState(false);
  
  const handleUploadComplete = () => {
    refetchDocuments();
    setShowUpload(false);
  };
  
  const handleViewDocument = (document: any) => {
    // View document logic here
    window.open(document.url, '_blank');
  };
  
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
      
      <Card className="shadow-sm border-[#0485ea]/10">
        <CardContent className="p-0">
          <DocumentsTableContent 
            documents={documents} 
            loading={loading} 
            onViewDocument={handleViewDocument}
            onToggleUploadForm={() => setShowUpload(true)}
          />
        </CardContent>
      </Card>
      
      {showUpload && (
        <DocumentUpload
          entityId={workOrderId}
          onClose={() => setShowUpload(false)}
          onUploadComplete={handleUploadComplete}
          isOpen={showUpload}
        />
      )}
    </div>
  );
};

export default WorkOrderDocuments;
