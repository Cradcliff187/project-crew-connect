
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { File, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Document } from '@/components/documents/schemas/documentSchema';

interface EstimateDocumentsTabProps {
  estimateId: string;
  documents?: Document[];
}

const EstimateDocumentsTab: React.FC<EstimateDocumentsTabProps> = ({ estimateId, documents = [] }) => {

  const openDocument = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No documents attached to this estimate.
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.document_id} className="flex items-center p-3 border rounded-md bg-white">
                <div className="p-2 bg-blue-50 rounded-md mr-3">
                  <File className="h-5 w-5 text-[#0485ea]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{doc.file_name}</h4>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="mr-2">
                      {doc.category || 'Other'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(doc.created_at)}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[#0485ea]"
                  onClick={() => openDocument(doc.url || '')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimateDocumentsTab;
