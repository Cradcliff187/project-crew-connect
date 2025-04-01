
import React from 'react';
import { Document } from './schemas/documentSchema';
import { Button } from '@/components/ui/button';
import { FileIcon, Loader2, Upload, FileText, FileArchive, FilePlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface DocumentListProps {
  documents: Document[];
  loading?: boolean;
  onDocumentClick?: (document: Document) => void;
  onDocumentDelete?: (document: Document) => void;
  onUploadClick?: () => void;
  emptyMessage?: string;
  showEntityInfo?: boolean;
  showCategories?: boolean;
}

const getDocumentIcon = (document: Document) => {
  const fileType = document.file_type?.toLowerCase() || '';
  
  if (fileType.includes('image')) return '🖼️';
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('doc')) return '📝';
  if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
  if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️';
  
  return '📎';
};

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading = false,
  onDocumentClick,
  onDocumentDelete,
  onUploadClick,
  emptyMessage = "No documents found",
  showEntityInfo = true,
  showCategories = true
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading documents...</span>
      </div>
    );
  }
  
  if (documents.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-md">
        <FileArchive className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">{emptyMessage}</p>
        {onUploadClick && (
          <Button 
            onClick={onUploadClick} 
            variant="outline" 
            className="mt-4"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        )}
      </div>
    );
  }
  
  // Group documents by category if needed
  let groupedDocuments = documents;
  let categories: Record<string, Document[]> = {};
  
  if (showCategories) {
    documents.forEach(doc => {
      const category = doc.category || 'other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(doc);
    });
  }
  
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  const formatCategoryName = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-4">
      {showCategories && Object.keys(categories).length > 0 ? (
        Object.entries(categories).map(([category, docs]) => (
          <div key={category} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {formatCategoryName(category)}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {docs.map(document => (
                <DocumentListItem
                  key={document.document_id}
                  document={document}
                  onClick={onDocumentClick}
                  onDelete={onDocumentDelete}
                  showEntityInfo={showEntityInfo}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {documents.map(document => (
            <DocumentListItem
              key={document.document_id}
              document={document}
              onClick={onDocumentClick}
              onDelete={onDocumentDelete}
              showEntityInfo={showEntityInfo}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface DocumentListItemProps {
  document: Document;
  onClick?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  showEntityInfo: boolean;
}

const DocumentListItem: React.FC<DocumentListItemProps> = ({
  document,
  onClick,
  onDelete,
  showEntityInfo
}) => {
  const icon = getDocumentIcon(document);
  const isClickable = !!onClick;
  const uploadedDate = formatDistanceToNow(new Date(document.created_at), { addSuffix: true });
  
  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const handleClick = () => {
    if (onClick) onClick(document);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(document);
  };

  return (
    <div
      className={`border rounded-md p-3 flex items-start gap-3 ${
        isClickable 
          ? 'cursor-pointer hover:bg-gray-50 hover:border-[#0485ea]/30' 
          : ''
      }`}
      onClick={isClickable ? handleClick : undefined}
    >
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-50 rounded border border-blue-100">
        <span className="text-lg" aria-hidden="true">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 truncate">
            <p className="font-medium text-sm truncate" title={document.file_name}>
              {document.file_name}
            </p>
            <p className="text-xs text-muted-foreground flex items-center mt-1 gap-1">
              <span>{uploadedDate}</span>
              {document.file_size && (
                <>
                  <span className="inline-block mx-1">•</span>
                  <span>{formatFileSize(document.file_size)}</span>
                </>
              )}
            </p>
          </div>
        </div>
        
        {showEntityInfo && document.entity_type && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs bg-gray-50">
              {document.entity_type.replace(/_/g, ' ').toLowerCase()}
            </Badge>
          </div>
        )}
        
        {document.is_expense && (
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 mt-2">
            Receipt
          </Badge>
        )}
      </div>
    </div>
  );
};

export default DocumentList;
