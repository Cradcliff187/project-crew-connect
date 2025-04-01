
import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { WorkOrderDocument } from './types';
import DocumentViewer from '@/components/documents/DocumentViewer';

interface WorkOrderDocumentViewerProps {
  document: WorkOrderDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WorkOrderDocumentViewer: React.FC<WorkOrderDocumentViewerProps> = ({ 
  document, 
  open, 
  onOpenChange 
}) => {
  // Convert WorkOrderDocument to the Document type expected by the generic DocumentViewer
  const convertedDocument = document ? {
    document_id: document.id,
    file_name: document.file_name,
    file_type: document.file_type,
    file_size: document.file_size,
    storage_path: document.file_url,
    entity_type: 'WORK_ORDER',
    entity_id: document.project_id,
    created_at: document.created_at,
    updated_at: document.created_at,
    url: document.url || '',
    category: document.category
  } : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DocumentViewer
        document={convertedDocument}
        open={open}
        onOpenChange={onOpenChange}
      />
    </Dialog>
  );
};

export default WorkOrderDocumentViewer;
