
import React from 'react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, XCircle, ArrowRight } from 'lucide-react';
import { EstimateRevision } from '../types/estimateTypes';

interface EstimateRevisionTimelineProps {
  revisions: EstimateRevision[];
  currentRevisionId: string | undefined;
  onSelectRevision: (revisionId: string) => void;
}

const EstimateRevisionTimeline: React.FC<EstimateRevisionTimelineProps> = ({ 
  revisions,
  currentRevisionId,
  onSelectRevision
}) => {
  // Sort revisions by version
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
      case 'draft':
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getStatusColor = (status: string | undefined) => {
    switch(status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // If no revisions, show placeholder
  if (revisions.length === 0) {
    return (
      <div className="text-center p-6 border rounded-md bg-slate-50">
        <p className="text-muted-foreground">No revision history available</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-medium mb-3">Revision Timeline</h3>
      <div className="space-y-2">
        {sortedRevisions.map((revision, index) => (
          <div 
            key={revision.id} 
            className={`relative flex items-center p-3 rounded-md border cursor-pointer transition-all
              ${currentRevisionId === revision.id ? 'border-[#0485ea] bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:bg-slate-50'}
            `}
            onClick={() => onSelectRevision(revision.id)}
          >
            <div className="flex-shrink-0 mr-3">
              {getStatusIcon(revision.status)}
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-sm">Version {revision.version}</span>
                    {revision.is_current && (
                      <Badge variant="outline" className="ml-2 bg-[#0485ea]/10 text-[#0485ea] border-[#0485ea]/20 text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(revision.revision_date)}
                  </div>
                </div>
                <Badge variant="outline" className={`${getStatusColor(revision.status)} text-xs uppercase font-medium`}>
                  {revision.status || 'Draft'}
                </Badge>
              </div>
              {revision.notes && (
                <div className="text-xs text-gray-600 mt-1.5 line-clamp-2">{revision.notes}</div>
              )}
              <div className="text-xs font-medium mt-1.5">
                ${revision.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </div>
            </div>
            
            {currentRevisionId === revision.id && (
              <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 h-full">
                <div className="h-full w-[3px] bg-[#0485ea] rounded-full"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EstimateRevisionTimeline;
