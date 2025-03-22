
import React from 'react';
import { FileText, FileImage, File } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { DocumentBase } from '@/components/documents/types/documentTypes';

interface DocumentCardProps {
  document: DocumentBase;
  onViewDocument: () => void;
}

const DocumentCard = ({ document, onViewDocument }: DocumentCardProps) => {
  // Helper function to determine document icon
  const getDocumentIcon = () => {
    if (document.file_type?.startsWith('image/')) {
      return <FileImage className="h-10 w-10 text-blue-400" />;
    }

    if (document.category === 'receipt' || document.category === 'invoice') {
      return <FileText className="h-10 w-10 text-green-500" />;
    }

    return <File className="h-10 w-10 text-muted-foreground" />;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start">
          {getDocumentIcon()}
          <div className="ml-3 overflow-hidden">
            <p className="font-medium truncate">{document.file_name}</p>
            <p className="text-xs text-muted-foreground">
              {document.category ? document.category : 'Uncategorized'} • {formatDate(document.created_at)}
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2 text-[#0485ea]"
              onClick={onViewDocument}
            >
              View Document
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
