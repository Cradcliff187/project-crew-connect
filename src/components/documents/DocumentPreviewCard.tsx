
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Document } from './schemas/documentSchema';
import { FileText, Eye, Download, Trash2, FileImage, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface DocumentPreviewCardProps {
  document: Document;
  onView: () => void;
  onDelete: () => void;
  showEntityInfo?: boolean; // Adding this prop
}

const DocumentPreviewCard: React.FC<DocumentPreviewCardProps> = ({ 
  document, 
  onView, 
  onDelete,
  showEntityInfo = false
}) => {
  const getDocumentIcon = () => {
    if (document.file_type?.startsWith('image/')) {
      return <FileImage className="h-4 w-4 text-blue-500" />;
    }
    
    if (document.file_type?.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    
    return <File className="h-4 w-4 text-gray-500" />;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            {getDocumentIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">{document.file_name}</h4>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="outline" className="text-xs">
                {document.category || 'Other'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(document.created_at)}
              </span>
            </div>
            
            {showEntityInfo && document.entity_type && (
              <div className="text-xs text-muted-foreground mt-1">
                {document.entity_type}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end mt-2 space-x-2">
          <Button variant="ghost" size="sm" onClick={onView}>
            <Eye className="h-3.5 w-3.5 mr-1" />
            View
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentPreviewCard;
