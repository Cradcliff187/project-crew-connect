
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Download, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { WorkOrderDocument, BaseDocument } from './types';

interface DocumentCardProps {
  document: WorkOrderDocument;
  onViewDocument: (document: WorkOrderDocument) => void;
}

const DocumentCard = ({ document, onViewDocument }: DocumentCardProps) => {
  return (
    <Card key={document.document_id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start">
          <FileText className="h-10 w-10 mr-3 text-muted-foreground shrink-0" />
          <div className="overflow-hidden">
            <p className="font-medium truncate">{document.file_name}</p>
            <p className="text-xs text-muted-foreground">
              {document.is_receipt ? 'Material Receipt' : document.category ? document.category : 'Uncategorized'} • {formatDate(document.created_at)}
            </p>
            <div className="mt-2 flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-[#0485ea] border-[#0485ea]/30 hover:bg-blue-50"
                onClick={() => onViewDocument(document)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-[#0485ea] border-[#0485ea]/30 hover:bg-blue-50"
                asChild
              >
                <a href={document.url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
