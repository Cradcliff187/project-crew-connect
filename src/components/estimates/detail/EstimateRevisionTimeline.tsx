
import React from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle, ArrowRightCircle } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { EstimateRevision } from '../types/estimateTypes';

interface EstimateRevisionTimelineProps {
  revisions: EstimateRevision[];
  currentRevisionId?: string;
  onSelectRevision: (id: string) => void;
}

const EstimateRevisionTimeline: React.FC<EstimateRevisionTimelineProps> = ({ 
  revisions, 
  currentRevisionId,
  onSelectRevision
}) => {
  // Sort revisions by version (newest first)
  const sortedRevisions = [...revisions].sort((a, b) => b.version - a.version);
  
  // Helper function to get status icon
  const getStatusIcon = (status: string | undefined) => {
    switch(status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sent':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getStatusColor = (status: string | undefined) => {
    switch(status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  // Find the index of the current revision
  const currentRevisionIndex = currentRevisionId 
    ? sortedRevisions.findIndex(r => r.id === currentRevisionId)
    : -1;
  
  if (revisions.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md bg-slate-50">
        <p className="text-muted-foreground">No revisions available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium mb-3">Version History</h3>
      
      <div className="space-y-3">
        {sortedRevisions.map((revision, index) => {
          const isCurrent = revision.id === currentRevisionId;
          
          return (
            <div 
              key={revision.id}
              className={`p-3 border rounded-md ${isCurrent ? 'bg-[#0485ea]/5 border-[#0485ea]/20' : 'hover:bg-slate-50'}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center">
                  <Badge variant="outline" className={`${isCurrent ? 'bg-[#0485ea]/10 text-[#0485ea] border-[#0485ea]/20' : 'bg-gray-100'}`}>
                    v{revision.version}
                  </Badge>
                  
                  {revision.is_current && !isCurrent && (
                    <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-800 border-blue-200">
                      Current
                    </Badge>
                  )}
                </div>
                
                <Badge variant="outline" className={`${getStatusColor(revision.status)}`}>
                  <span className="flex items-center">
                    {getStatusIcon(revision.status)}
                    <span className="ml-1 uppercase text-xs">{revision.status || 'Draft'}</span>
                  </span>
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {formatDate(revision.revision_date)}
                </div>
                
                <div className="font-medium">
                  {formatCurrency(revision.amount || 0)}
                </div>
              </div>
              
              {!isCurrent && (
                <div className="mt-2 flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => onSelectRevision(revision.id)}
                  >
                    <ArrowRightCircle className="h-3.5 w-3.5 mr-1.5" />
                    View This Version
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EstimateRevisionTimeline;
