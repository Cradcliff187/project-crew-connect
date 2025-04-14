import React, { useMemo } from 'react';
import { Document } from './schemas/documentSchema';
import { Badge } from '@/components/ui/badge';
import { formatFileSize } from '@/lib/utils';
import { FileText, FileImage, FileArchive } from 'lucide-react';

interface DocumentMetricsProps {
  documents: Document[];
}

const DocumentMetrics: React.FC<DocumentMetricsProps> = ({ documents }) => {
  const metrics = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    let totalSize = 0;
    let imageCount = 0;
    let pdfCount = 0;
    let recentCount = 0; // Last 30 days

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    documents.forEach(doc => {
      // Calculate category counts
      if (doc.category) {
        categoryCounts[doc.category] = (categoryCounts[doc.category] || 0) + 1;
      }

      // Calculate total size
      totalSize += doc.file_size || 0;

      // Count images and PDFs
      if (doc.file_type?.includes('image')) {
        imageCount++;
      } else if (doc.file_type?.includes('pdf')) {
        pdfCount++;
      }

      // Count recent documents
      const docDate = new Date(doc.created_at);
      if (docDate >= thirtyDaysAgo) {
        recentCount++;
      }
    });

    return {
      totalCount: documents.length,
      totalSize,
      imageCount,
      pdfCount,
      recentCount,
      categoryCounts,
    };
  }, [documents]);

  // Get top 3 categories
  const topCategories = useMemo(() => {
    return Object.entries(metrics.categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [metrics.categoryCounts]);

  return (
    <div className="py-2">
      <div className="flex flex-wrap gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Total Documents</div>
          <div className="text-2xl font-semibold">{metrics.totalCount}</div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">Total Size</div>
          <div className="text-2xl font-semibold">{formatFileSize(metrics.totalSize)}</div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">Recent (30 days)</div>
          <div className="text-2xl font-semibold">{metrics.recentCount}</div>
        </div>

        <div className="ml-auto">
          <div className="text-sm text-muted-foreground mb-1">Top Categories</div>
          <div className="flex gap-2">
            {topCategories.map(([category, count]) => (
              <Badge
                key={category}
                variant="outline"
                className="bg-[#0485ea]/10 text-[#0485ea] border-[#0485ea]/20"
              >
                {category.replace(/_/g, ' ')} ({count})
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentMetrics;
