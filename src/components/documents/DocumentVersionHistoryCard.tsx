
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Clock, Download, Eye, Calendar, FileIcon } from 'lucide-react';
import { Document } from './schemas/documentSchema';

interface DocumentVersionHistoryCardProps {
  documents: Document[];
  currentVersion?: number;
  className?: string;
  onVersionSelect?: (document: Document) => void;
  showDownloadButton?: boolean;
}

const DocumentVersionHistoryCard: React.FC<DocumentVersionHistoryCardProps> = ({
  documents,
  currentVersion = 1,
  className = '',
  onVersionSelect,
  showDownloadButton = true
}) => {
  // Sort documents by version, with the newest first
  const sortedDocuments = [...documents].sort((a, b) => 
    (b.version || 1) - (a.version || 1)
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center">
          Version History
          <Badge variant="outline" className="ml-2 font-normal">
            {documents.length} {documents.length === 1 ? 'version' : 'versions'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {sortedDocuments.length === 0 ? (
          <p className="text-muted-foreground text-sm">No version history available</p>
        ) : (
          <div className="space-y-2">
            {sortedDocuments.map((doc) => (
              <div 
                key={doc.document_id}
                className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                  (doc.version || 1) === currentVersion 
                    ? 'bg-[#0485ea]/5 border border-[#0485ea]/30' 
                    : 'hover:bg-muted/50 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FileIcon className={`h-5 w-5 ${(doc.version || 1) === currentVersion ? 'text-[#0485ea]' : 'text-muted-foreground'}`} />
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium">Version {doc.version || 1}</span>
                      {(doc.version || 1) === currentVersion && (
                        <Badge variant="outline" className="ml-2 bg-[#0485ea]/10 text-[#0485ea] border-[#0485ea]/30">Current</Badge>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-3">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(doc.created_at)}
                      </span>
                      {doc.uploaded_by && (
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {doc.uploaded_by}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {showDownloadButton && doc.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(doc.url, '_blank');
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                  )}
                  {onVersionSelect && (doc.version || 1) !== currentVersion && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onVersionSelect(doc)}
                      className="h-8"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentVersionHistoryCard;
