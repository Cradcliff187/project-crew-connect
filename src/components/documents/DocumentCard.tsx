import React from 'react';
import { Document } from './schemas/documentSchema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, File, Image, MoreHorizontal } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { DocumentCategoryBadge } from './utils/categoryIcons';
import { cn } from '@/lib/utils';
import { useDocumentNavigation } from './hooks/useDocumentNavigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DocumentCardProps {
  document: Document;
  onClick?: () => void;
  batchMode?: boolean;
  isSelected?: boolean;
  showNavigationButton?: boolean;
  getActions?: (
    document: Document
  ) => Array<{ icon: React.ReactNode; label: string; onClick: () => void }>;
  // Legacy props for backward compatibility
  onView?: () => void;
  onDelete?: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onClick,
  batchMode = false,
  isSelected = false,
  showNavigationButton = false,
  getActions,
  // Legacy props
  onView,
  onDelete,
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

  // Handle click on the card
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (onView) {
      // Legacy support
      onView();
    }
  };

  // Get actions from props or fallback to legacy actions
  const actions = getActions ? getActions(document) : [];

  // Add legacy actions if provided and getActions is not
  if (!getActions) {
    if (onView) {
      actions.push({
        icon: <FileText className="h-4 w-4" />,
        label: 'View',
        onClick: onView,
      });
    }
    if (onDelete) {
      actions.push({
        icon: <FileText className="h-4 w-4" />,
        label: 'Delete',
        onClick: onDelete,
      });
    }
  }

  return (
    <Card
      className={cn(
        'hover:border-[#0485ea]',
        isSelected && 'ring-2 ring-[#0485ea] border-[#0485ea] bg-blue-50/30',
        (batchMode || onClick) && 'cursor-pointer'
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {getFileIcon()}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm line-clamp-1">{document.file_name}</h4>
              {document.category && <DocumentCategoryBadge category={document.category} />}
            </div>

            <div className="text-xs text-muted-foreground mt-1">
              Added on {formatDate(document.created_at)}
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="text-xs capitalize">
                {document.entity_type.toLowerCase().replace('_', ' ')}
                {document.entity_id && !document.entity_id.includes('general') && (
                  <span className="ml-1">#{document.entity_id.slice(-5)}</span>
                )}
              </span>

              {!batchMode && actions.length > 0 && (
                <div className="flex items-center">
                  {actions.length <= 2 ? (
                    <div className="flex gap-1">
                      {actions.map((action, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={e => {
                            e.stopPropagation();
                            action.onClick();
                          }}
                        >
                          {action.icon}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions.map((action, index) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={e => {
                              e.stopPropagation();
                              action.onClick();
                            }}
                          >
                            <span className="mr-2">{action.icon}</span>
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
