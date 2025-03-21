
import React from 'react';
import { ExternalLink, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Document } from '@/components/documents/schemas/documentSchema';
import { formatDate } from '@/lib/utils';

interface DocumentCardProps {
  document: Document;
  openDocument: (url: string) => void;
  getDocumentIcon: (fileType: string | null) => JSX.Element;
  formatFileSize: (bytes: number | null) => string;
  getCategoryBadgeColor: (category: string) => string;
  formatCategoryName: (category: string) => string;
  getVendorTypeDisplay: (vendorType: string) => string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  openDocument,
  getDocumentIcon,
  formatFileSize,
  getCategoryBadgeColor,
  formatCategoryName,
  getVendorTypeDisplay
}) => {
  return (
    <div className="flex items-center p-3 border rounded-md bg-white hover:bg-blue-50 transition-colors">
      <div className="p-2 bg-blue-50 rounded-md mr-3">
        {getDocumentIcon(document.file_type)}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{document.file_name}</h4>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {formatDate(document.created_at)} • {document.file_size ? formatFileSize(document.file_size) : 'Unknown size'}
          </span>
          {document.category && (
            <Badge className={getCategoryBadgeColor(document.category)}>
              {formatCategoryName(document.category)}
            </Badge>
          )}
          {document.vendor_id && document.vendor_type && (
            <Badge variant="outline" className="border-[#0485ea] text-[#0485ea]">
              {getVendorTypeDisplay(document.vendor_type)}
            </Badge>
          )}
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-[#0485ea]"
        onClick={() => openDocument(document.url || '')}
        disabled={!document.url}
      >
        <ExternalLink className="h-4 w-4 mr-1" />
        View
      </Button>
    </div>
  );
};

export default DocumentCard;
