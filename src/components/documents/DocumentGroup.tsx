
import React from 'react';
import { ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Document } from './schemas/documentSchema';
import { documentCardAnimations, getDocumentCategoryColor } from '@/lib/animations';
import DocumentCard from './DocumentCard';
import { Button } from '@/components/ui/button';

interface DocumentGroupProps {
  title: string;
  documents: Document[];
  onViewDocument: (document: Document) => void;
  onDeleteDocument?: (document: Document) => void;
  showEntityInfo?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  color?: string;
  showNavigationButton?: boolean;
  batchMode?: boolean;
  selectedDocuments?: string[];
  onToggleSelection?: (documentId: string) => void;
}

const DocumentGroup: React.FC<DocumentGroupProps> = ({
  title,
  documents,
  onViewDocument,
  onDeleteDocument,
  showEntityInfo = false,
  isExpanded = true,
  onToggleExpand,
  color,
  showNavigationButton = false,
  batchMode = false,
  selectedDocuments = [],
  onToggleSelection
}) => {
  const groupColor = color || getDocumentCategoryColor(title);
  
  const handleToggle = () => {
    if (onToggleExpand) {
      onToggleExpand();
    }
  };
  
  return (
    <div className="space-y-2 animate-fade-in">
      <div 
        className={cn(
          "flex items-center gap-2 p-2 rounded-md cursor-pointer",
          "transition-colors duration-200 hover:bg-muted"
        )}
        onClick={handleToggle}
      >
        <Button 
          variant="ghost" 
          size="sm"
          className="p-0 h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
        >
          {isExpanded ? 
            <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          }
        </Button>
        
        <Folder className="h-4 w-4" style={{ color: groupColor }} />
        
        <h3 className="text-sm font-medium" style={{ color: groupColor }}>
          {title}
          <span className="ml-2 text-muted-foreground font-normal">
            ({documents.length})
          </span>
        </h3>
      </div>
      
      {isExpanded && (
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-8 animate-fade-in"
        >
          {documents.map(doc => (
            <DocumentCard
              key={doc.document_id}
              document={doc}
              onView={() => {
                if (batchMode && onToggleSelection) {
                  onToggleSelection(doc.document_id || '');
                } else {
                  onViewDocument(doc);
                }
              }}
              onDelete={onDeleteDocument ? () => onDeleteDocument(doc) : undefined}
              showNavigationButton={showNavigationButton}
              batchMode={batchMode}
              isSelected={selectedDocuments.includes(doc.document_id || '')}
              onClick={
                batchMode && onToggleSelection 
                  ? () => onToggleSelection(doc.document_id || '')
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentGroup;
