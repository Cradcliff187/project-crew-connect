
import React from 'react';
import { Document } from './schemas/documentSchema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DocumentPreviewCard from './DocumentPreviewCard';
import { Clock, Loader2 } from 'lucide-react';

interface RecentDocumentsSectionProps {
  documents: Document[];
  loading: boolean;
  onViewDocument: (document: Document) => void;
  showNavigationButtons?: boolean;
}

const RecentDocumentsSection: React.FC<RecentDocumentsSectionProps> = ({
  documents,
  loading,
  onViewDocument,
  showNavigationButtons = false
}) => {
  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Clock className="mr-2 h-5 w-5 text-[#0485ea]" />
            Recent Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 text-[#0485ea] animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return null; // Don't show the section if there are no recent documents
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Clock className="mr-2 h-5 w-5 text-[#0485ea]" />
          Recent Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((document) => (
            <DocumentPreviewCard
              key={document.document_id}
              document={document}
              onView={() => onViewDocument(document)}
              showEntityInfo={true}
              showNavigationButton={showNavigationButtons}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentDocumentsSection;
