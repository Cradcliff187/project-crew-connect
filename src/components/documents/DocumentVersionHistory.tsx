
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, DownloadIcon, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Document } from './schemas/documentSchema';

interface DocumentVersionHistoryProps {
  documents: Document[];
  currentVersion?: number;
  onVersionSelect?: (document: Document) => void;
}

const DocumentVersionHistory: React.FC<DocumentVersionHistoryProps> = ({
  documents,
  currentVersion = 1,
  onVersionSelect
}) => {
  // Sort documents by version, with the newest first
  const sortedDocuments = [...documents].sort((a, b) => 
    (b.version || 1) - (a.version || 1)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Version History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedDocuments.length === 0 ? (
          <p className="text-muted-foreground text-sm">No version history available</p>
        ) : (
          <div className="space-y-3">
            {sortedDocuments.map((doc) => (
              <div 
                key={doc.document_id}
                className={`flex items-center justify-between p-2 rounded-md ${
                  (doc.version || 1) === currentVersion 
                    ? 'bg-[#0485ea]/5 border border-[#0485ea]/30' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium">Version {doc.version || 1}</span>
                      {(doc.version || 1) === currentVersion && (
                        <Badge variant="outline" className="ml-2">Current</Badge>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      <span>
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {doc.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                  )}
                  {onVersionSelect && (doc.version || 1) !== currentVersion && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onVersionSelect(doc)}
                    >
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

export default DocumentVersionHistory;
