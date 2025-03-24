
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, Trash2, FileText, FileImage, File } from 'lucide-react';
import { Document } from './schemas/documentSchema';
import { formatDate } from '@/lib/utils';

interface DocumentPreviewCardProps {
  document: Document;
  onView: () => void;
  onDelete?: () => void;
  showEntityInfo?: boolean;
}

const DocumentPreviewCard = ({ 
  document, 
  onView, 
  onDelete,
  showEntityInfo = false
}: DocumentPreviewCardProps) => {
  // Get appropriate icon based on file type
  const getFileIcon = () => {
    if (!document.file_type) return <File className="h-8 w-8 text-gray-400" />;
    
    const fileType = document.file_type.toLowerCase();
    if (fileType.startsWith('image/')) {
      return <FileImage className="h-8 w-8 text-blue-400" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-8 w-8 text-red-400" />;
    }
    return <File className="h-8 w-8 text-gray-400" />;
  };

  // Format file size for display
  const formatFileSize = (size?: number) => {
    if (!size) return 'Unknown size';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (document.url) {
      window.open(document.url, '_blank');
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer bg-white border border-[#0485ea]/10"
      onClick={onView}
    >
      <div className="h-12 bg-[#0485ea]/5 flex items-center px-4">
        <div className="flex items-center space-x-2">
          {getFileIcon()}
          <div className="truncate max-w-[180px]">
            <p className="font-medium text-sm truncate">{document.file_name}</p>
          </div>
        </div>
      </div>
      
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatDate(document.created_at)}</span>
            <span>{formatFileSize(document.file_size)}</span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {document.category && (
              <Badge variant="outline" className="capitalize text-xs">
                {document.category}
              </Badge>
            )}
            {showEntityInfo && document.entity_type && (
              <Badge variant="secondary" className="text-xs">
                {document.entity_type.replace(/_/g, ' ').toLowerCase()}
              </Badge>
            )}
            {document.is_expense && (
              <Badge className="bg-green-500 text-xs">Receipt</Badge>
            )}
          </div>
          
          <div className="flex justify-between mt-2">
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={(e) => { e.stopPropagation(); onView(); }}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            {onDelete && (
              <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentPreviewCard;
