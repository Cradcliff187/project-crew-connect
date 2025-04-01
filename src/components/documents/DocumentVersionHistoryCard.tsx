
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Document } from './schemas/documentSchema';
import { format } from 'date-fns';
import { FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  // Sort documents by version, with latest version first
  const sortedDocuments = [...documents].sort((a, b) => 
    (b.version || 1) - (a.version || 1)
  );

  return (
    <Card className="shadow-sm border-[#0485ea]/10">
      <CardHeader className="bg-[#0485ea]/5 py-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#0485ea]" />
          Document Version History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {sortedDocuments.map((doc) => {
            const version = doc.version || 1;
            const isCurrentVersion = version === currentVersion;
            
            return (
              <div 
                key={doc.document_id} 
                className={`flex items-center justify-between p-3 
                  ${isCurrentVersion ? 'bg-[#0485ea]/5' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <FileText className={`h-5 w-5 ${isCurrentVersion ? 'text-[#0485ea]' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-sm font-medium">
                      Version {version}
                      {isCurrentVersion && <span className="text-xs ml-2 text-[#0485ea]">(Current)</span>}
                    </p>
                    <p className="text-xs text-gray-500">
                      {doc.created_at ? format(new Date(doc.created_at), 'MMM d, yyyy h:mm a') : 'Unknown date'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onVersionSelect(doc)}
                  disabled={isCurrentVersion}
                  className={!isCurrentVersion ? 'text-[#0485ea] hover:text-[#0375d1] hover:bg-[#0485ea]/10' : ''}
                >
                  {isCurrentVersion ? 'Current' : 'View'}
                </Button>
              </div>
            );
          })}
          
          {sortedDocuments.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No version history available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentVersionHistoryCard;
