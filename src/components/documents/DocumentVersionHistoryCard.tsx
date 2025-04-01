
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Document } from './schemas/documentSchema';
import { Button } from '@/components/ui/button';
import { FileIcon, Clock, CheckCircle } from 'lucide-react';

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
  const sortedDocuments = [...documents].sort((a, b) => 
    (b.version || 1) - (a.version || 1)
  );

  return (
    <Card className="shadow-sm border-[#0485ea]/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#0485ea]" />
          Document Version History
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 py-1">
        <ul className="space-y-1">
          {sortedDocuments.map((doc) => {
            const isCurrentVersion = (doc.version || 1) === currentVersion;
            const timeAgo = doc.created_at 
              ? formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })
              : 'Unknown date';
            
            return (
              <li key={doc.document_id} className="border-b last:border-b-0 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">
                          Version {doc.version || 1}
                        </span>
                        {isCurrentVersion && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{timeAgo}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onVersionSelect(doc)}
                    className={isCurrentVersion ? "text-[#0485ea]" : ""}
                  >
                    View
                  </Button>
                </div>
                {doc.notes && (
                  <div className="mt-1 text-xs text-gray-600 ml-6">
                    Note: {doc.notes}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

export default DocumentVersionHistoryCard;
