import React from 'react';
import { Document } from './schemas/documentSchema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Download, Eye, Trash2, Calendar, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { documentCardAnimations, getDocumentCategoryColor } from '@/lib/animations';
import { cn } from '@/lib/utils';
import EntityInformation from './EntityInformation';
import DocumentEntityLink from './DocumentEntityLink';
import { useDocumentNavigation } from './hooks/useDocumentNavigation';

interface DocumentPreviewCardProps {
  document: Document;
  onView: () => void;
  onDelete?: () => void;
  showEntityInfo?: boolean;
  isSelected?: boolean;
  batchMode?: boolean;
  showNavigationButton?: boolean;
  categoryColor?: string;
}

const DocumentPreviewCard: React.FC<DocumentPreviewCardProps> = ({
  document,
  onView,
  onDelete,
  showEntityInfo = false,
  isSelected = false,
  batchMode = false,
  showNavigationButton = false,
  categoryColor,
}) => {
  const { navigateToEntity } = useDocumentNavigation();
  const isImage = document.file_type?.startsWith('image/');
  const isPdf = document.file_type === 'application/pdf';

  const color = categoryColor || getDocumentCategoryColor(document.category);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (document.url) {
      // Use window.document instead of document to avoid confusion with the Document type
      const a = window.document.createElement('a');
      a.href = document.url;
      a.download = document.file_name || 'download';
      a.target = '_blank';
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    }
  };

  return (
    <Card
      className={cn(
        documentCardAnimations.enter,
        documentCardAnimations.hover,
        documentCardAnimations.active,
        'h-full flex flex-col overflow-hidden border-l-4 cursor-pointer',
        {
          [documentCardAnimations.selected]: isSelected,
          'pointer-events-none opacity-75': batchMode && !isSelected,
        }
      )}
      style={{ borderLeftColor: color }}
      onClick={batchMode ? undefined : onView}
    >
      <div className="h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
        {isImage && document.url ? (
          <img
            src={document.url}
            alt={document.file_name || 'Document preview'}
            className="h-full w-full object-cover hover:scale-110 transition-transform"
          />
        ) : isPdf ? (
          <div className="flex flex-col items-center justify-center h-full bg-red-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-red-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <path d="M9 15v-2h6v2"></path>
              <path d="M12 15v3"></path>
            </svg>
            <span className="text-xs text-red-700 font-medium mt-1">PDF</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <line x1="10" y1="9" x2="8" y2="9"></line>
            </svg>
            <span className="text-xs font-medium mt-1">
              {document.file_type?.split('/')[1] || 'File'}
            </span>
          </div>
        )}
      </div>

      <CardContent className="flex-grow p-3 space-y-2">
        <h3 className="font-medium text-sm line-clamp-1" title={document.file_name}>
          {document.file_name}
        </h3>

        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{formatDate(document.created_at)}</span>
        </div>

        {document.category && (
          <Badge
            variant="outline"
            style={{ borderColor: `${color}30`, color: color, background: `${color}10` }}
          >
            {document.category.replace(/_/g, ' ')}
          </Badge>
        )}

        {document.budget_item_id && (
          <Badge variant="outline" className="ml-1 bg-green-50 text-green-700 border-green-200">
            Budget Item
          </Badge>
        )}

        {showEntityInfo &&
          document.entity_type &&
          document.entity_id &&
          !document.entity_id.includes('general') && (
            <div className="mt-2 border-t pt-2">
              <EntityInformation document={document} />
            </div>
          )}
      </CardContent>

      <CardFooter className="p-2 border-t bg-gray-50">
        <div className="flex justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            className="h-8 text-[#0485ea] hover:text-[#0485ea]/80"
          >
            <Eye className="h-4 w-4 mr-1" />
            <span className="text-xs">View</span>
          </Button>

          <div className="flex">
            <Button variant="ghost" size="sm" onClick={handleDownload} className="h-8">
              <Download className="h-4 w-4" />
            </Button>

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            {showNavigationButton && document.entity_type && document.entity_id && (
              <DocumentEntityLink
                document={document}
                variant="ghost"
                size="sm"
                showEntityType={false}
              />
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DocumentPreviewCard;
