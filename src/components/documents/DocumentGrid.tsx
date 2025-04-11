
import React from 'react';
import { Card } from '@/components/ui/card';
import { Document } from './schemas/documentSchema';
import { Button } from '@/components/ui/button';
import { Eye, Download, File } from 'lucide-react';
import { DocumentCategoryBadge } from './utils/categoryIcons';
import { formatDate } from '@/lib/utils';

interface DocumentGridProps {
  documents: Document[];
  loading?: boolean;
  onViewDocument: (document: Document) => void;
  emptyMessage?: string;
  showEntityInfo?: boolean;
  showCategories?: boolean;
}

const DocumentGrid: React.FC<DocumentGridProps> = ({
  documents,
  loading = false,
  onViewDocument,
  emptyMessage = "No documents found",
  showEntityInfo = false,
  showCategories = true
}) => {
  // Handle document download
  const handleDownload = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    if (doc.url) {
      const link = window.document.createElement('a');
      link.href = doc.url;
      link.download = doc.file_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  // Get file icon based on type
  const getFileIcon = (fileType: string | undefined) => {
    if (!fileType) return <File className="h-8 w-8 text-gray-400" />;
    
    if (fileType.includes('image')) {
      return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-blue-500"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>;
    }
    
    if (fileType.includes('pdf')) {
      return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-red-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>;
    }
    
    return <File className="h-8 w-8 text-gray-400" />;
  };
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="h-48 animate-pulse bg-gray-100 flex items-center justify-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!documents || documents.length === 0) {
    return (
      <div className="text-center p-10 border rounded-md bg-gray-50">
        <File className="h-12 w-12 text-gray-300 mx-auto mb-2" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <Card 
          key={doc.document_id}
          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onViewDocument(doc)}
        >
          <div className="h-24 bg-muted flex items-center justify-center">
            {getFileIcon(doc.file_type)}
          </div>
          <div className="p-3">
            <p className="font-medium text-sm truncate mb-1" title={doc.file_name}>
              {doc.file_name}
            </p>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-muted-foreground">
                {formatDate(doc.created_at)}
              </p>
              {showCategories && doc.category && (
                <DocumentCategoryBadge category={doc.category} />
              )}
            </div>
            {showEntityInfo && (
              <p className="text-xs text-muted-foreground mb-3">
                {doc.entity_type.toLowerCase()} • {doc.entity_id}
              </p>
            )}
            <div className="flex justify-between mt-2">
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2"
                onClick={(e) => handleDownload(doc, e)}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DocumentGrid;
