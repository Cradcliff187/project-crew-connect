
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Document } from './schemas/documentSchema';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  // Sort documents by version in descending order
  const sortedDocuments = [...documents].sort((a, b) => 
    (b.version || 1) - (a.version || 1)
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center">
          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
          Version History
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <ScrollArea className="h-[calc(100vh-320px)] md:max-h-[500px] pr-4">
          <div className="space-y-2">
            {sortedDocuments.map((doc) => {
              const isCurrentVersion = doc.version === currentVersion;
              const createdDate = new Date(doc.created_at);
              const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });
              
              return (
                <TooltipProvider key={doc.document_id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isCurrentVersion ? "default" : "ghost"}
                        onClick={() => onVersionSelect(doc)}
                        className={`w-full justify-start h-auto py-2 px-3 ${
                          isCurrentVersion 
                            ? "bg-[#0485ea]/10 text-[#0485ea] hover:bg-[#0485ea]/20" 
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-start gap-2 w-full">
                          <div className={`mt-0.5 ${isCurrentVersion ? "text-[#0485ea]" : "text-muted-foreground"}`}>
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">Version {doc.version || 1}</span>
                              {isCurrentVersion && (
                                <Check className="h-4 w-4 text-[#0485ea]" />
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 truncate" title={timeAgo}>
                              {timeAgo}
                            </div>
                            {doc.notes && (
                              <div className="text-xs text-muted-foreground mt-1 line-clamp-2" title={doc.notes}>
                                {doc.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {isCurrentVersion 
                          ? "Current version" 
                          : `View version ${doc.version || 1}`}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DocumentVersionHistoryCard;
