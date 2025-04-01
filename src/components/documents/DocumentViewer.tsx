
import React, { useState } from 'react';
import { Document } from './schemas/documentSchema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Image, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface DocumentViewerProps {
  document: Document;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  embedded?: boolean; // This prop is now properly defined
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  document, 
  className,
  embedded = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  
  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };
  
  // Show when there is no preview available 
  const renderNoPreview = () => (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 py-12">
      <FileText className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
      <h3 className="font-medium text-lg mb-2">Preview not available</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        This file type cannot be previewed directly. Please download the file to view its contents.
      </p>
    </div>
  );
  
  // Show when there is an error loading the preview
  const renderError = () => (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 py-12">
      <AlertCircle className="h-16 w-16 text-destructive opacity-50 mb-4" />
      <h3 className="font-medium text-lg mb-2">Unable to load preview</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        There was an error loading the preview for this document. The file may be corrupted or in an unsupported format.
      </p>
    </div>
  );
  
  // Determine the preview type based on the file type
  const getPreviewType = () => {
    if (!document.file_type) return 'none';
    
    const fileType = document.file_type.toLowerCase();
    
    if (fileType.includes('image/')) {
      return 'image';
    } else if (fileType.includes('pdf')) {
      return 'pdf';
    } else {
      return 'none';
    }
  };
  
  const previewType = getPreviewType();
  
  return (
    <div className={cn("relative w-full h-full flex items-center justify-center", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <Skeleton className="h-[80%] w-[80%] rounded-md" />
        </div>
      )}
      
      {hasError ? (
        renderError()
      ) : (
        <>
          {previewType === 'image' && document.url && (
            <div className="flex items-center justify-center h-full w-full overflow-auto bg-gray-50">
              <img 
                src={document.url} 
                alt={document.file_name} 
                className="max-w-full max-h-full object-contain"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
          )}
          
          {previewType === 'pdf' && document.url && (
            <iframe 
              src={`${document.url}#toolbar=0`}
              className="w-full h-full"
              onLoad={() => setIsLoading(false)}
              onError={handleImageError}
            />
          )}
          
          {previewType === 'none' && renderNoPreview()}
        </>
      )}
    </div>
  );
};

export default DocumentViewer;
