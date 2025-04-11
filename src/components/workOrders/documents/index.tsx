import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, FileText, Upload, RefreshCw } from 'lucide-react';
import { DocumentUpload, DocumentViewer, DocumentList } from '@/components/documents';
import { Document, documentService, EntityType } from '@/services/documentService';

interface WorkOrderDocumentsProps {
  workOrderId: string;
  entityType: string;
}

const WorkOrderDocuments = ({ workOrderId, entityType }: WorkOrderDocumentsProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    fetchDocuments();
  }, [workOrderId, entityType, refreshTrigger]);
  
  const fetchDocuments = async () => {
    if (!workOrderId) return;
    
    setLoading(true);
    try {
      // Normalize entity type to our standard format
      const normalizedEntityType = entityType.toUpperCase() as EntityType;
      
      // Fetch documents using our standardized service
      const docs = await documentService.getDocumentsByEntity(normalizedEntityType, workOrderId);
      setDocuments(docs);
      
      // If this is a work order, we also need to fetch related expense receipts
      if (normalizedEntityType === 'WORK_ORDER') {
        // This would be handled by a specialized function for work order-specific document relationships
        // For now, we'll keep it simple
      }
      
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUploadComplete = () => {
    setShowUpload(false);
    setRefreshTrigger(prev => prev + 1); // Trigger a refresh
  };
  
  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
  };
  
  // Convert string entityType to proper EntityType
  const getEntityType = (): EntityType => {
    const upperEntityType = entityType.toUpperCase();
    
    // Ensure we're using a valid EntityType
    const validTypes: EntityType[] = [
      'PROJECT', 'WORK_ORDER', 'ESTIMATE', 'CUSTOMER', 
      'VENDOR', 'CONTACT', 'SUBCONTRACTOR', 'EXPENSE', 
      'TIME_ENTRY', 'EMPLOYEE', 'ESTIMATE_ITEM'
    ];
    
    return validTypes.includes(upperEntityType as EntityType) 
      ? upperEntityType as EntityType
      : 'WORK_ORDER';
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-[#0485ea]/10 p-4 rounded-md">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#0485ea]" />
          <h3 className="text-base font-medium">Work Order Documents</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="border-[#0485ea]/30 text-[#0485ea] hover:text-[#0485ea] hover:bg-[#0485ea]/10"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button 
            onClick={() => setShowUpload(true)}
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <DocumentList
            documents={documents}
            loading={loading}
            onViewDocument={handleViewDocument}
          />
        </div>
      </div>
      
      {showUpload && (
        <Card className="shadow-sm border-[#0485ea]/10">
          <CardContent className="p-4">
            <div className="mb-2 flex justify-between items-center">
              <h3 className="text-lg font-medium">Upload Document</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowUpload(false)}
              >
                Cancel
              </Button>
            </div>
            <DocumentUpload
              entityType={getEntityType()}
              entityId={workOrderId}
              onSuccess={handleUploadComplete}
              onCancel={() => setShowUpload(false)}
            />
          </CardContent>
        </Card>
      )}
      
      <DocumentViewer
        document={selectedDocument}
        open={!!selectedDocument}
        onOpenChange={(open) => !open && setSelectedDocument(null)}
      />
    </div>
  );
};

export default WorkOrderDocuments;
