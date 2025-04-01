
import React from 'react';
import { Document } from './schemas/documentSchema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, ArrowRight } from 'lucide-react';
import DocumentCard from './DocumentCard';

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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium flex items-center">
            <Clock className="mr-2 h-5 w-5 text-[#0485ea]" />
            Recent Documents
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[120px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!documents.length) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium flex items-center">
          <Clock className="mr-2 h-5 w-5 text-[#0485ea]" />
          Recent Documents
        </h2>
        <Button variant="link" className="text-[#0485ea]">
          <ArrowRight className="h-4 w-4 mr-1" />
          View all
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {documents.map((document) => (
          <DocumentCard 
            key={document.document_id}
            document={document}
            onView={() => onViewDocument(document)}
            showNavigationButton={showNavigationButtons}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentDocumentsSection;
