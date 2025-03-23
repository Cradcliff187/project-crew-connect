
import { Card, CardContent } from '@/components/ui/card';
import { useWorkOrderDocumentsEmbed } from './useWorkOrderDocumentsEmbed';
import { DocumentsGrid } from '../details/DocumentsList';
import { Button } from '@/components/ui/button';
import { FileUp, FileText } from 'lucide-react';
import { useState } from 'react';
import DocumentUpload from '@/components/documents/DocumentUpload';

interface WorkOrderDocumentsProps {
  workOrderId: string;
  entityType: string;
}

const WorkOrderDocuments = ({ workOrderId, entityType }: WorkOrderDocumentsProps) => {
  const { documents, loading, error, refetchDocuments } = useWorkOrderDocumentsEmbed(workOrderId, entityType);
  const [showUpload, setShowUpload] = useState(false);
  
  const handleUploadComplete = () => {
    refetchDocuments();
    setShowUpload(false);
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
          <DocumentsGrid 
            documents={documents} 
            loading={loading} 
            error={error} 
          />
          
          {documents.length > 0 ? (
            <div className="flex justify-between items-center bg-gray-50 p-4 border-t">
              <div className="flex items-center gap-2 text-gray-600">
                <FileText size={18} />
                <span className="font-medium">Total Documents: {documents.length}</span>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
      
      {showUpload && (
        <DocumentUpload
          entityId={workOrderId}
          entityType={entityType}
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </div>
  );
};

export default WorkOrderDocuments;
