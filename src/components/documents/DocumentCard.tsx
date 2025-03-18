
import React from 'react';
import { FileText, FileImage, File, Eye, Download, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Document } from './schemas/documentSchema';
import { formatDate } from '@/lib/utils';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';

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

  const getDocumentActions = (): ActionGroup[] => {
    return [
      {
        items: [
          {
            label: 'View',
            icon: <Eye className="w-4 h-4" />,
            onClick: (e) => onView()
          },
          {
            label: 'Download',
            icon: <Download className="w-4 h-4" />,
            onClick: (e) => {
              if (document.url) {
                window.open(document.url, '_blank');
              }
            }
          }
        ]
      },
      {
        items: [
          {
            label: 'Delete',
            icon: <Trash2 className="w-4 h-4" />,
            onClick: (e) => onDelete(),
            className: 'text-destructive'
          }
        ]
      }
    ];
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
            <ActionMenu groups={getDocumentActions()} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
