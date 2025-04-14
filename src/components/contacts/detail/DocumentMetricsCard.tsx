import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, Upload } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Document } from '@/components/documents/schemas/documentSchema';

interface DocumentMetricsCardProps {
  documents: Document[];
  loading: boolean;
}

const DocumentMetricsCard: React.FC<DocumentMetricsCardProps> = ({ documents, loading }) => {
  // Calculate metrics
  const totalDocuments = documents.length;
  const documentsByType = documents.reduce(
    (acc, doc) => {
      const category = doc.category || 'other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Get the most recent document
  const mostRecentDocument =
    documents.length > 0
      ? documents.reduce(
          (latest, doc) => (new Date(doc.created_at) > new Date(latest.created_at) ? doc : latest),
          documents[0]
        )
      : null;

  // Get the date of the oldest document
  const oldestDocumentDate =
    documents.length > 0
      ? documents.reduce(
          (oldest, doc) => (new Date(doc.created_at) < new Date(oldest.created_at) ? doc : oldest),
          documents[0]
        ).created_at
      : null;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Document Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Document Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#0485ea]" />
            <span className="text-sm font-medium">Total Documents</span>
          </div>
          <span className="text-sm font-medium">{totalDocuments}</span>
        </div>

        {mostRecentDocument && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-[#0485ea]" />
              <span className="text-sm font-medium">Latest Upload</span>
            </div>
            <span className="text-sm">{formatDate(mostRecentDocument.created_at)}</span>
          </div>
        )}

        {oldestDocumentDate && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#0485ea]" />
              <span className="text-sm font-medium">First Document</span>
            </div>
            <span className="text-sm">{formatDate(oldestDocumentDate)}</span>
          </div>
        )}

        {/* Document categories breakdown */}
        {Object.keys(documentsByType).length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-medium mb-2 text-muted-foreground">DOCUMENT TYPES</h4>
            <div className="space-y-1">
              {Object.entries(documentsByType).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-xs capitalize">{category.replace('_', ' ')}</span>
                  <span className="text-xs font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentMetricsCard;
