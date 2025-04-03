
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  LineChart, 
  BarChart, 
  FileText, 
  Receipt, 
  Image, 
  FileVideo, 
  FileCode,
  Loader2
} from 'lucide-react';
import { getEntityDocumentCounts } from '@/utils/documentManager';
import { EntityType } from './schemas/documentSchema';

interface DocumentMetricsCardProps {
  entityType: EntityType;
  entityId: string;
}

const DocumentMetricsCard: React.FC<DocumentMetricsCardProps> = ({
  entityType,
  entityId
}) => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<{
    total: number;
    byCategory: Record<string, number>;
  }>({
    total: 0,
    byCategory: {}
  });
  
  // Fetch metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      const counts = await getEntityDocumentCounts(entityType, entityId);
      setMetrics(counts);
      setLoading(false);
    };
    
    fetchMetrics();
  }, [entityId, entityType]);
  
  // Get category display name
  const getCategoryDisplayName = (category: string) => {
    switch (category.toLowerCase()) {
      case 'report':
        return 'Reports';
      case 'contract':
        return 'Contracts';
      case 'invoice':
        return 'Invoices';
      case 'receipt':
        return 'Receipts';
      case 'photo':
        return 'Photos';
      case 'proposal':
        return 'Proposals';
      case 'plan':
        return 'Plans & Drawings';
      case 'permit':
        return 'Permits & Licenses';
      case 'general':
        return 'General Documents';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };
  
  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'report':
        return <BarChart className="h-4 w-4 text-blue-500" />;
      case 'contract':
        return <FileText className="h-4 w-4 text-violet-500" />;
      case 'invoice':
        return <LineChart className="h-4 w-4 text-green-500" />;
      case 'receipt':
        return <Receipt className="h-4 w-4 text-amber-500" />;
      case 'photo':
        return <Image className="h-4 w-4 text-pink-500" />;
      case 'plan':
        return <FileCode className="h-4 w-4 text-cyan-500" />;
      case 'video':
        return <FileVideo className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  if (metrics.total === 0) {
    return null; // Don't show metrics if there are no documents
  }
  
  return (
    <Card className="bg-[#0485ea]/5 border-[#0485ea]/20">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Document Summary</h3>
            <div className="flex items-center">
              <div className="rounded-full bg-[#0485ea]/20 p-3 mr-3">
                <FileText className="h-6 w-6 text-[#0485ea]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.total}</p>
                <p className="text-sm text-muted-foreground">Total Documents</p>
              </div>
            </div>
          </div>
          
          {Object.keys(metrics.byCategory).length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">By Category</h3>
              <div className="space-y-2">
                {Object.entries(metrics.byCategory)
                  .sort(([, countA], [, countB]) => countB - countA)
                  .slice(0, 4)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getCategoryIcon(category)}
                        <span className="ml-2 text-sm">{getCategoryDisplayName(category)}</span>
                      </div>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))
                }
                
                {/* Show more if there are more categories */}
                {Object.keys(metrics.byCategory).length > 4 && (
                  <div className="text-xs text-muted-foreground text-center pt-1">
                    + {Object.keys(metrics.byCategory).length - 4} more categories
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentMetricsCard;
