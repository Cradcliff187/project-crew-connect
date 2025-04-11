
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Download, FileText, FileImage, File as FileIcon, FileX } from 'lucide-react';
import { Document } from './schemas/documentSchema';

interface DocumentListProps {
  documents: Document[];
  loading?: boolean;
  onViewDocument: (document: Document) => void;
  onDocumentDelete?: (document: Document) => void;
  emptyMessage?: string;
  showEntityInfo?: boolean;
  showCategories?: boolean;
  showNavigationButtons?: boolean;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading = false,
  onViewDocument,
  onDocumentDelete,
  emptyMessage = "No documents found",
  showEntityInfo = false,
  showCategories = false,
  showNavigationButtons = false
}) => {
  // Helper function to determine the correct icon based on file type
  const getFileIcon = (fileType: string | undefined) => {
    if (!fileType) return <FileIcon className="h-4 w-4" />;
    
    if (fileType.includes('image')) return <FileImage className="h-4 w-4 text-blue-500" />;
    if (fileType.includes('pdf')) return <FileX className="h-4 w-4 text-red-500" />;
    
    return <FileText className="h-4 w-4 text-gray-500" />;
  };
  
  // Handle document download
  const handleDownload = (document: Document) => {
    if (document.url) {
      const link = document.createElement('a');
      link.href = document.url;
      link.download = document.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex justify-between p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="space-y-1">
                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                    <div className="w-24 h-3 bg-gray-100 rounded"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-20 h-8 bg-gray-200 rounded"></div>
                  <div className="w-20 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-center h-40">
            <FileText className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Format file size for display
  const formatFileSize = (sizeInBytes: number | undefined): string => {
    if (!sizeInBytes) return '';
    
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    else if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    else return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          {documents.map((document) => (
            <div 
              key={document.document_id} 
              className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {getFileIcon(document.file_type)}
                <div>
                  <p className="font-medium truncate max-w-[200px] md:max-w-[300px]">
                    {document.file_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {document.file_size && formatFileSize(document.file_size)}
                    {document.created_at && ` • ${new Date(document.created_at).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onViewDocument(document)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    if (document.url) {
                      window.open(document.url, '_blank');
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                {onDocumentDelete && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDocumentDelete(document)}
                  >
                    <FileX className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentList;
