
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Document } from './schemas/documentSchema';
import { Clock, FileText } from 'lucide-react';

interface DocumentVersionHistoryCardProps {
  documents: Document[];
  currentVersion: number;
  onVersionSelect: (document: Document) => void;
}

const DocumentVersionHistoryCard: React.FC<DocumentVersionHistoryCardProps> = ({
  documents,
  currentVersion,
  onVersionSelect
}) => {
  // Sort documents by version, newest first
  const sortedDocuments = [...documents].sort((a, b) => {
    const versionA = a.version || 1;
    const versionB = b.version || 1;
    return versionB - versionA;
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center">
          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
          Document History
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {sortedDocuments.length === 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No version history available
          </div>
        ) : (
          <div className="space-y-2">
            {sortedDocuments.map((doc) => {
              const version = doc.version || 1;
              const isCurrentVersion = version === currentVersion;
              
              return (
                <div 
                  key={doc.document_id} 
                  className={`p-2 border rounded-md ${isCurrentVersion ? 'border-[#0485ea]/40 bg-[#0485ea]/5' : 'border-border hover:bg-slate-50'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <FileText className={`h-4 w-4 mt-0.5 ${isCurrentVersion ? 'text-[#0485ea]' : 'text-muted-foreground'}`} />
                      <div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium">Version {version}</span>
                          {isCurrentVersion && (
                            <span className="ml-2 text-xs bg-[#0485ea]/20 text-[#0485ea] px-1.5 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(doc.created_at)}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className={isCurrentVersion ? 'opacity-50 cursor-not-allowed' : 'text-[#0485ea]'}
                      disabled={isCurrentVersion}
                      onClick={() => !isCurrentVersion && onVersionSelect(doc)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentVersionHistoryCard;
