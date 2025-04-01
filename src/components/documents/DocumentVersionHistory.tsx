
import React from 'react';
import DocumentVersionHistoryCard from './DocumentVersionHistoryCard';
import { Document } from './schemas/documentSchema';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';

interface DocumentVersionHistoryProps {
  documentId?: string;
  onVersionChange?: (document: Document) => void;
  trigger?: React.ReactNode;
}

const DocumentVersionHistory: React.FC<DocumentVersionHistoryProps> = ({
  documentId,
  onVersionChange,
  trigger
}) => {
  const [open, setOpen] = React.useState(false);

  const handleVersionChange = (document: Document) => {
    if (onVersionChange) {
      onVersionChange(document);
    }
    setOpen(false);
  };

  if (!documentId) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
          >
            <History className="h-4 w-4 mr-2" />
            Version History
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl w-[90vw]">
        <DialogHeader>
          <DialogTitle>Document Version History</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <DocumentVersionHistoryCard 
            documentId={documentId} 
            onVersionChange={handleVersionChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentVersionHistory;
