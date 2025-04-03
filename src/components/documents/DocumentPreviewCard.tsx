
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Download, 
  ExternalLink, 
  File, 
  FileImage, 
  FilePdf, 
  FileText, 
  MoreVertical, 
  Tag, 
  Trash2 
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatFileSize } from '@/lib/utils';
import { Document } from './schemas/documentSchema';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import NavigateToEntityButton from './NavigateToEntityButton';
import EntityInformation from './EntityInformation';

interface DocumentPreviewCardProps {
  document: Document;
  onView: (document: Document) => void;
  onDelete?: (document: Document) => void;
  className?: string;
  showNavigationButtons?: boolean;
}

const DocumentPreviewCard: React.FC<DocumentPreviewCardProps> = ({ 
  document, 
  onView, 
  onDelete,
  className = '',
  showNavigationButtons = true
}) => {
  const getFileIcon = () => {
    if (!document.file_type) return <File className="h-12 w-12 text-gray-400" />;
    
    if (document.file_type.startsWith('image/')) {
      return <FileImage className="h-12 w-12 text-blue-500" />;
    }
    
    if (document.file_type === 'application/pdf') {
      return <FilePdf className="h-12 w-12 text-red-500" />;
    }
    
    return <FileText className="h-12 w-12 text-gray-500" />;
  };
  
  const getCardStyle = () => {
    // Determine background hint color based on document category or entity type
    if (document.category === 'receipt' || document.is_expense) {
      return {
        borderColor: 'rgb(251, 191, 36)',
        bgColor: 'rgba(251, 191, 36, 0.1)'
      };
    }
    
    if (document.entity_type === 'PROJECT') {
      return {
        borderColor: '#0485ea',
        bgColor: 'rgba(4, 133, 234, 0.05)'
      };
    }
    
    if (document.entity_type === 'WORK_ORDER') {
      return {
        borderColor: 'rgb(16, 185, 129)',
        bgColor: 'rgba(16, 185, 129, 0.05)'
      };
    }
    
    if (document.entity_type === 'VENDOR') {
      return {
        borderColor: 'rgb(139, 92, 246)',
        bgColor: 'rgba(139, 92, 246, 0.05)'
      };
    }
    
    if (document.entity_type === 'CUSTOMER') {
      return {
        borderColor: 'rgb(249, 115, 22)',
        bgColor: 'rgba(249, 115, 22, 0.05)'
      };
    }
    
    // Default style
    return {
      borderColor: 'rgb(226, 232, 240)',
      bgColor: 'white'
    };
  };
  
  const styles = getCardStyle();
  
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!document.url) return;
    
    const a = document.createElement('a');
    a.href = document.url;
    a.download = document.file_name || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return (
    <Card 
      className={`overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${className}`}
      style={{ borderLeft: `4px solid ${styles.borderColor}`, background: styles.bgColor }}
      onClick={() => onView(document)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            {getFileIcon()}
            <div className="space-y-1">
              <h3 className="font-medium text-sm leading-tight line-clamp-2" title={document.file_name}>
                {document.file_name}
              </h3>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(document.created_at)}
                </span>
                <span>
                  {formatFileSize(document.file_size || 0)}
                </span>
              </div>
              
              {/* Show entity relation if available */}
              {document.entity_id && document.entity_type && document.entity_id !== 'detached' && (
                <div className="mt-1">
                  <EntityInformation document={document} />
                </div>
              )}
              
              {/* Show tags if available */}
              {document.tags && document.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {document.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs py-0 h-5 bg-muted">
                      {tag}
                    </Badge>
                  ))}
                  {document.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs py-0 h-5 bg-muted">
                      +{document.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-start gap-1 ml-2">
            {showNavigationButtons && document.entity_type && document.entity_id && document.entity_id !== 'detached' && (
              <NavigateToEntityButton 
                document={document} 
                size="icon"
                variant="ghost"
                className="h-7 w-7"
              />
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={e => { e.stopPropagation(); onView(document); }}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); onDelete(document); }}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentPreviewCard;

// Loading skeleton for documents
export const DocumentCardSkeleton = () => (
  <Card className="overflow-hidden">
    <CardContent className="p-4">
      <div className="flex gap-3">
        <Skeleton className="h-12 w-12 rounded" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
