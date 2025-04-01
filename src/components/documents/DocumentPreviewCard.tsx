
import React from 'react';
import { Document } from './schemas/documentSchema';
import { Trash2, Eye, FileText, File, Image, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { DocumentCategoryBadge } from './utils/categoryIcons';
import { cn } from '@/lib/utils';
import { useDocumentNavigation } from './hooks/useDocumentNavigation';

interface DocumentPreviewCardProps {
  document: Document;
  onView: () => void;
  onDelete?: () => void;
  showEntityInfo?: boolean;
  isSelected?: boolean;
  batchMode?: boolean;
  showNavigationButton?: boolean;
}

const DocumentPreviewCard: React.FC<DocumentPreviewCardProps> = ({
  document,
  onView,
  onDelete,
  showEntityInfo = false,
  isSelected = false,
  batchMode = false,
  showNavigationButton = false
}) => {
  const { navigateToEntity } = useDocumentNavigation();
  
  // Determine file type
  const isImage = document.file_type?.startsWith('image/');
  const isPdf = document.file_type?.includes('pdf');
  
  const getDocumentIcon = () => {
    if (isImage) return <Image className="h-5 w-5 text-blue-500" />;
    if (isPdf) return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  return (
    <Card 
      className={cn(
        "h-full flex flex-col transition-all border hover:border-[#0485ea] hover:shadow-sm group overflow-hidden",
        isSelected && "ring-2 ring-[#0485ea] border-[#0485ea] bg-blue-50/30",
        batchMode ? "cursor-pointer" : "cursor-default"
      )}
      onClick={batchMode ? onView : undefined}
    >
      <CardContent className="p-4 flex-grow space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getDocumentIcon()}
            <h3 className="font-medium text-sm line-clamp-1">{document.file_name}</h3>
          </div>
          {document.category && (
            <DocumentCategoryBadge category={document.category} />
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          Added on {formatDate(document.created_at)}
        </div>
        
        {showEntityInfo && document.entity_type && (
          <div className="text-xs capitalize">
            <span className="text-muted-foreground">Associated with: </span>
            <span className="font-medium">{document.entity_type.toLowerCase().replace('_', ' ')}</span>
            {document.entity_id && !document.entity_id.includes('general') && (
              <span className="font-medium"> #{document.entity_id.slice(-5)}</span>
            )}
          </div>
        )}
        
        {document.notes && (
          <div className="text-xs mt-2">
            <p className="line-clamp-2 text-muted-foreground">{document.notes}</p>
          </div>
        )}
      </CardContent>
      
      {!batchMode && (
        <CardFooter className="px-4 py-3 pt-0 flex justify-end gap-2 mt-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
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
              className="h-8 w-8 text-[#0485ea]"
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
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default DocumentPreviewCard;
