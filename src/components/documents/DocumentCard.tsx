
import React from 'react';
import { Document } from './schemas/documentSchema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, File, FileText, Image, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { DocumentCategoryBadge } from './utils/categoryIcons';
import { cn } from '@/lib/utils';
import { useDocumentNavigation } from './hooks/useDocumentNavigation';

interface DocumentCardProps {
  document: Document;
  onView: () => void;
  onDelete?: () => void;
  batchMode?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  showNavigationButton?: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onView,
  onDelete,
  batchMode = false,
  isSelected = false,
  onClick,
  showNavigationButton = false
}) => {
  const { navigateToEntity } = useDocumentNavigation();
  
  // Determine icon based on file type
  const getFileIcon = () => {
    if (document.file_type?.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    if (document.file_type?.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  return (
    <Card 
      className={cn(
        "hover:border-[#0485ea]",
        isSelected && "ring-2 ring-[#0485ea] border-[#0485ea] bg-blue-50/30",
        batchMode && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {getFileIcon()}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm line-clamp-1">{document.file_name}</h4>
              {document.category && (
                <DocumentCategoryBadge category={document.category} />
              )}
            </div>
            
            <div className="text-xs text-muted-foreground mt-1">
              Added on {formatDate(document.created_at)}
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs capitalize">
                {document.entity_type.toLowerCase().replace('_', ' ')}
                {document.entity_id && !document.entity_id.includes('general') && 
                  <span className="ml-1">#{document.entity_id.slice(-5)}</span>
                }
              </span>
              
              {!batchMode && (
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost"
                    size="icon" 
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView();
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {showNavigationButton && document.entity_id && !document.entity_id.includes('general') && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-[#0485ea]"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToEntity(document);
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onDelete && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
