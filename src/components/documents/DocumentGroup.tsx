
import React from 'react';
import { Document } from './schemas/documentSchema';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { getDocumentCategoryColor } from '@/lib/animations';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import DocumentPreviewCard from './DocumentPreviewCard';
import { cn } from '@/lib/utils';

interface DocumentGroupProps {
  title: string;
  documents: Document[];
  onViewDocument: (document: Document) => void;
  onDeleteDocument?: (document: Document) => void;
  showEntityInfo?: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
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
  isExpanded,
  onToggleExpand,
  showNavigationButton = false,
  batchMode = false,
  selectedDocuments = [],
  onToggleSelection
}) => {
  if (!documents || documents.length === 0) return null;
  
  const categoryColor = getDocumentCategoryColor(title);
  const formattedTitle = title.replace('_', ' ').toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Calculate if all documents in this group are selected
  const areAllSelected = documents.every(
    doc => selectedDocuments.includes(doc.document_id || '')
  );

  // Toggle selection for all documents in this group
  const toggleSelectAll = () => {
    if (!onToggleSelection) return;
    documents.forEach(doc => {
      if (doc.document_id) {
        onToggleSelection(doc.document_id);
      }
    });
  };

  return (
    <Card 
      className={cn(
        "border-l-4 transition-all duration-200",
        isExpanded ? "shadow-sm" : "shadow-none",
        { [`border-l-[${categoryColor}]`]: true }
      )}
      style={{ borderLeftColor: categoryColor }}
    >
      <CardHeader className="p-3 cursor-pointer flex flex-row items-center justify-between" onClick={onToggleExpand}>
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4" style={{ color: categoryColor }} />
          <h3 className="font-medium text-base">{formattedTitle}</h3>
          <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
            {documents.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {batchMode && (
            <Checkbox
              checked={areAllSelected}
              onCheckedChange={toggleSelectAll}
              onClick={e => e.stopPropagation()}
              className="mr-2"
            />
          )}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-3 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 animate-fade-in">
            {documents.map((document) => (
              <div key={document.document_id} className="relative">
                {batchMode && (
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedDocuments.includes(document.document_id || '')}
                      onCheckedChange={() => onToggleSelection && document.document_id && onToggleSelection(document.document_id)}
                      className="bg-white border-gray-300"
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                )}
                <DocumentPreviewCard
                  document={document}
                  onView={() => onViewDocument(document)}
                  onDelete={onDeleteDocument ? () => onDeleteDocument(document) : undefined}
                  showEntityInfo={showEntityInfo}
                  isSelected={selectedDocuments.includes(document.document_id || '')}
                  batchMode={batchMode}
                  showNavigationButton={showNavigationButton}
                  categoryColor={categoryColor}
                />
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default DocumentGroup;
