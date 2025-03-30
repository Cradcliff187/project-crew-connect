
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileIcon, 
  FileTextIcon, 
  FileImageIcon, 
  EyeIcon, 
  Trash2Icon,
  DownloadIcon
} from "lucide-react";
import { formatFileSize } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { Document } from './schemas/documentSchema';

interface DocumentPreviewCardProps {
  document: Document;
  onView?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  showActions?: boolean;
}

const DocumentPreviewCard: React.FC<DocumentPreviewCardProps> = ({
  document,
  onView,
  onDelete,
  onDownload,
  showActions = true
}) => {
  // Helper function to get document icon based on file type
  const getDocumentIcon = () => {
    if (!document.file_type) return <FileIcon className="h-4 w-4" />;
    
    if (document.file_type.includes('image')) {
      return <FileImageIcon className="h-4 w-4" />;
    } else if (document.file_type.includes('pdf')) {
      return <FileTextIcon className="h-4 w-4" />;
    }
    
    return <FileIcon className="h-4 w-4" />;
  };
  
  // Helper to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getDocumentIcon()}
              <div className="truncate font-medium max-w-[180px]">
                {document.file_name}
              </div>
            </div>
            
            {document.category && (
              <Badge variant="outline" className="ml-auto text-xs">
                {document.category}
              </Badge>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            {document.file_size && (
              <div>{formatFileSize(document.file_size)}</div>
            )}
            {document.created_at && (
              <div>Added on {formatDate(document.created_at)}</div>
            )}
          </div>
          
          {showActions && (
            <div className="flex gap-1 mt-1 justify-end">
              {onView && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={onView}
                  title="View document"
                >
                  <EyeIcon className="h-4 w-4" />
                </Button>
              )}
              
              {onDownload && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={onDownload}
                  title="Download document"
                >
                  <DownloadIcon className="h-4 w-4" />
                </Button>
              )}
              
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive" 
                  onClick={onDelete}
                  title="Delete document"
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentPreviewCard;
