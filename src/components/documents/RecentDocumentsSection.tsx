
import React from 'react';
import { Document } from './schemas/documentSchema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { DocumentCategoryBadge } from './utils/categoryIcons';

interface RecentDocumentsProps {
  documents: Document[];
  loading: boolean;
  onViewDocument: (document: Document) => void;
}

const RecentDocumentsSection: React.FC<RecentDocumentsProps> = ({
  documents,
  loading,
  onViewDocument
}) => {
  // Empty state for no recent documents
  if (!loading && (!documents || documents.length === 0)) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Clock className="mr-2 h-5 w-5 text-[#0485ea]" />
            Recent Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No recent documents found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Clock className="mr-2 h-5 w-5 text-[#0485ea]" />
            Recent Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-md"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Limit to 3 most recent documents
  const recentDocs = documents.slice(0, 3);

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center">
          <Clock className="mr-2 h-5 w-5 text-[#0485ea]" />
          Recent Documents
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-[#0485ea]">
          View All
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentDocs.map((doc) => (
            <div 
              key={doc.document_id}
              className="p-4 border rounded-md hover:border-[#0485ea] hover:bg-blue-50/30 cursor-pointer transition-colors"
              onClick={() => onViewDocument(doc)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm truncate max-w-[80%]">{doc.file_name}</h4>
                {doc.category && <DocumentCategoryBadge category={doc.category} />}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                Added on {formatDate(doc.created_at)}
              </div>
              <div className="text-xs font-medium capitalize">
                {doc.entity_type?.toLowerCase().replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentDocumentsSection;
