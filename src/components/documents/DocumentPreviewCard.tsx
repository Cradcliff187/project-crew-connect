
import React from 'react';
import { Document } from './schemas/documentSchema';
import { 
  Calendar, 
  Eye, 
  FileText, 
  Trash2, 
  Tag,
  RefreshCw,
  User,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, getFileIconByType } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { getCategoryConfig } from './utils/categoryIcons';
import NavigateToEntityButton from './NavigateToEntityButton';

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
  const FileIcon = getFileIconByType(document.file_type);
  
  // Get the category configuration for styling
  const categoryConfig = document.category ? getCategoryConfig(document.category) : { 
    color: '#6b7280',
    label: 'Document',
    icon: FileText
  };
  
  // Create a component for the Category Icon using the configuration
  const CategoryIcon = categoryConfig.icon;
  
  // Format file size if available
  const formatFileSize = (sizeInBytes?: number) => {
    if (!sizeInBytes) return 'Unknown size';
    
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };
  
  // Get entity type display name
  const getEntityTypeDisplay = (entityType: string) => {
    switch (entityType.toUpperCase()) {
      case 'PROJECT':
        return 'Project';
      case 'WORK_ORDER':
        return 'Work Order';
      case 'CONTACT':
        return 'Contact';
      case 'VENDOR':
        return 'Vendor';
      case 'SUBCONTRACTOR':
        return 'Subcontractor';
      case 'ESTIMATE':
        return 'Estimate';
      default:
        return entityType;
    }
  };
  
  return (
    <Card 
      className={`overflow-hidden border transition-all duration-200 h-full flex flex-col ${
        isSelected 
          ? 'border-blue-500 bg-blue-50/30 shadow-md' 
          : 'hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={batchMode ? undefined : onView}
    >
      <div 
        className="h-32 flex items-center justify-center p-4"
        style={{ backgroundColor: `${categoryConfig.color}15` }}
      >
        <div className="relative">
          <FileIcon 
            className="h-16 w-16" 
            style={{ color: categoryConfig.color }}
          />
          {document.version && document.version > 1 && (
            <Badge 
              className="absolute -top-2 -right-2 text-xs px-1.5 py-0.5"
              style={{ 
                backgroundColor: categoryConfig.color,
                border: `1px solid ${categoryConfig.color}`
              }}
            >
              v{document.version}
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="flex-1 p-4 pt-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium truncate flex-1" title={document.file_name}>
            {document.file_name}
          </h4>
          
          {/* Navigation button to related entity */}
          {showNavigationButton && (
            <NavigateToEntityButton document={document} />
          )}
        </div>
        
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{formatDate(document.created_at)}</span>
        </div>
        
        {document.file_type && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <FileIcon className="h-3 w-3 mr-1" />
            <span className="uppercase">{document.file_type}</span>
            {document.file_size && (
              <span className="ml-1">({formatFileSize(document.file_size)})</span>
            )}
          </div>
        )}
        
        {document.entity_type && document.entity_id && showEntityInfo && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <CategoryIcon className="h-3 w-3 mr-1" />
            <span>{getEntityTypeDisplay(document.entity_type)}</span>
          </div>
        )}
        
        {document.category && (
          <Badge 
            variant="outline" 
            className="mt-1 text-xs font-normal capitalize"
            style={{ 
              color: categoryConfig.color,
              borderColor: `${categoryConfig.color}50`
            }}
          >
            <CategoryIcon className="h-3 w-3 mr-1" />
            {categoryConfig.label}
          </Badge>
        )}
      </CardContent>
      
      <CardFooter className="p-3 pt-0 border-t flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 text-xs flex-1 text-[#0485ea]"
          onClick={(e) => {
            if (batchMode) e.stopPropagation();
            if (!batchMode) onView();
          }}
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          View
        </Button>
        
        {onDelete && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DocumentPreviewCard;
