
import React from 'react';
import { FileText, FileImage, File, MoreVertical, Eye, Download, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Document } from './schemas/documentSchema';
import { formatDate } from '@/lib/utils';

interface DocumentCardProps {
  document: Document;
  onView: () => void;
  onDelete: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onView, onDelete }) => {
  const getDocumentIcon = () => {
    if (document.file_type?.startsWith('image/')) {
      return <FileImage className="h-10 w-10 text-blue-400" />;
    }

    switch (document.category) {
      case 'invoice':
      case 'receipt':
      case 'estimate':
      case 'contract':
        return <FileText className="h-10 w-10 text-[#0485ea]" />;
      case 'photo':
        return <FileImage className="h-10 w-10 text-green-500" />;
      default:
        return <File className="h-10 w-10 text-gray-400" />;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex items-center p-3">
          <div className="mr-3 flex-shrink-0">
            {getDocumentIcon()}
          </div>
          <div className="flex-1 min-w-0" onClick={onView}>
            <h3 className="text-sm font-medium truncate">{document.file_name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {document.category || 'Other'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(document.created_at)}
              </span>
            </div>
            {document.is_expense && document.amount && (
              <p className="text-xs font-medium text-green-600 mt-1">
                ${document.amount.toFixed(2)}
              </p>
            )}
          </div>
          <div className="ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    if (document.url) {
                      window.open(document.url, '_blank');
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
