
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Document } from './schemas/documentSchema';
import { useDocumentVersions } from './hooks/useDocumentVersions';
import { formatDate, formatFileSize } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowDown, Clock, RotateCcw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DocumentVersionHistoryCardProps {
  documentId: string;
  minimal?: boolean; 
  onVersionChange?: (document: Document) => void;
}

const DocumentVersionHistoryCard: React.FC<DocumentVersionHistoryCardProps> = ({ 
  documentId, 
  minimal = false, 
  onVersionChange 
}) => {
  const { versions, loading, error, currentVersion } = useDocumentVersions(documentId);
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">Version History</h3>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error || !versions.length) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">Version History</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {error || "No version history available"}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardContent className={minimal ? "p-2" : "p-4"}>
        <div className="flex justify-between items-center mb-3">
          <h3 className={`${minimal ? "text-xs" : "text-sm"} font-medium flex items-center gap-1`}>
            <Clock className={`${minimal ? "h-3 w-3" : "h-4 w-4"}`} />
            Version History
          </h3>
        </div>
        
        <div className="space-y-2">
          {versions.map((version, index) => (
            <div key={version.document_id || index} className="group">
              <div 
                className={`flex items-center justify-between ${minimal ? "py-1 text-xs" : "py-2"} group-hover:bg-muted/50 px-2 rounded-md transition-colors ${currentVersion === version.document_id ? "bg-blue-50" : ""}`}
              >
                <div className="flex flex-col">
                  <span className={`${minimal ? "text-xs" : "text-sm"} font-medium`}>
                    {version.document_id === currentVersion ? "Current" : `Version ${versions.length - index}`}
                  </span>
                  <span className={`${minimal ? "text-[10px]" : "text-xs"} text-muted-foreground`}>
                    {formatDate(version.created_at)} ({formatFileSize(version.file_size || 0)})
                  </span>
                </div>
                
                {onVersionChange && version.document_id !== currentVersion && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`${minimal ? "h-6 w-6" : "h-8 w-8"} text-blue-600 opacity-0 group-hover:opacity-100`}
                    onClick={() => onVersionChange(version)}
                  >
                    <RotateCcw className={`${minimal ? "h-3 w-3" : "h-4 w-4"}`} />
                  </Button>
                )}
              </div>
              
              {index < versions.length - 1 && (
                <div className="flex justify-center my-1">
                  <ArrowDown className={`${minimal ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentVersionHistoryCard;
