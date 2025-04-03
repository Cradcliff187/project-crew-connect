
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Document } from './schemas/documentSchema';
import { 
  FileText, 
  Image, 
  FileSpreadsheet, 
  File, 
  Calendar, 
  Tag, 
  Trash2,
  Download,
  Eye,
  ExternalLink
} from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import NavigateToEntityButton from './NavigateToEntityButton';

export interface DocumentPreviewCardProps {
  document: Document;
  onView?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  isSelected?: boolean;
  batchMode?: boolean;
  showNavigationButton?: boolean;
  showEntityInfo?: boolean;
}

export const DocumentCardSkeleton = () => (
  <Card>
    <CardContent className="p-0">
      <div className="animate-pulse">
        <div className="bg-muted h-32 rounded-t-lg"></div>
        <div className="p-4 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
          <div className="h-3 bg-muted rounded w-1/4"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const DocumentPreviewCard: React.FC<DocumentPreviewCardProps> = ({
  document,
  onView,
  onDelete,
  onDownload,
  isSelected = false,
  batchMode = false,
  showNavigationButton = false,
  showEntityInfo = false
}) => {
  // Determine file type icon
  const getFileIcon = () => {
    const fileType = document.file_type || '';
    
    if (fileType.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) {
      return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
    }
  };
  
  // Function to truncate long file names
  const truncateFileName = (name: string, maxLength: number = 30) => {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    
    const extension = name.lastIndexOf('.') > 0 ? name.substring(name.lastIndexOf('.')) : '';
    const baseName = name.substring(0, name.lastIndexOf('.') > 0 ? name.lastIndexOf('.') : name.length);
    
    if (baseName.length <= maxLength - 3 - extension.length) return name;
    
    return `${baseName.substring(0, maxLength - 3 - extension.length)}...${extension}`;
  };
  
  // Handle download
  const handleDownload = () => {
    if (!document.url) return;
    
    if (onDownload) {
      onDownload(document);
      return;
    }
    
    const a = document.createElement('a');
    a.href = document.url;
    a.download = document.file_name || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Display an image preview for image files
  const renderPreview = () => {
    const isImage = document.file_type?.startsWith('image/');
    
    if (isImage && document.url) {
      return (
        <div 
          className="h-32 bg-muted rounded-t-lg overflow-hidden flex items-center justify-center cursor-pointer"
          onClick={() => onView && onView(document)}
        >
          <img 
            src={document.url} 
            alt={document.file_name || 'Document preview'} 
            className="max-h-full max-w-full object-cover w-full h-full"
          />
        </div>
      );
    }
    
    return (
      <div 
        className="h-32 bg-muted/40 rounded-t-lg flex items-center justify-center cursor-pointer"
        onClick={() => onView && onView(document)}
      >
        {getFileIcon()}
      </div>
    );
  };
  
  return (
    <Card className={`overflow-hidden ${isSelected ? 'ring-2 ring-[#0485ea]' : ''}`}>
      {renderPreview()}
      
      <CardContent className="p-4">
        <h3 
          className="font-medium mb-1 truncate cursor-pointer text-[#0485ea]"
          title={document.file_name || 'Untitled document'}
          onClick={() => onView && onView(document)}
        >
          {truncateFileName(document.file_name || 'Untitled document')}
        </h3>
        
        <div className="flex flex-col space-y-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{formatDate(document.created_at || '')}</span>
            <span className="mx-1">•</span>
            <span>{formatFileSize(document.file_size || 0)}</span>
          </div>
          
          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {document.tags.slice(0, 2).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs px-1 py-0 h-5">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              {document.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                  +{document.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
          
          {/* Entity information if it exists and showEntityInfo is true */}
          {showEntityInfo && document.entity_type && document.entity_id && document.entity_id !== 'detached' && (
            <div className="mt-1">
              <NavigateToEntityButton document={document} />
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex gap-1 mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 flex-1"
              onClick={() => onView && onView(document)}
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">View</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 flex-1"
              onClick={handleDownload}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Download</span>
            </Button>
            
            {onDelete && !batchMode && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => onDelete(document)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            
            {showNavigationButton && document.entity_type && document.entity_id && document.entity_id !== 'detached' && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-[#0485ea] hover:text-[#0375d1] hover:bg-blue-50"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentPreviewCard;
