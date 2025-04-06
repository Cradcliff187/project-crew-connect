
import React from 'react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, XCircle, ArrowRight, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { EstimateRevision } from '../types/estimateTypes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  // Sort revisions by version (descending)
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
  
  // Calculate financial differences between revisions
  const calculateDifferences = () => {
    const differences: Record<string, { amount: number; percentage: number }> = {};
    
    // Go through revisions and calculate differences from previous revision
    for (let i = 0; i < sortedRevisions.length - 1; i++) {
      const currentRev = sortedRevisions[i];
      const prevRev = sortedRevisions[i + 1];
      
      if (currentRev.amount !== undefined && prevRev.amount !== undefined) {
        const diff = currentRev.amount - prevRev.amount;
        const percentage = prevRev.amount !== 0 
          ? ((diff / prevRev.amount) * 100)
          : 0;
        
        differences[currentRev.id] = {
          amount: diff,
          percentage: Math.round(percentage * 10) / 10
        };
      }
    }
    
    return differences;
  };
  
  const differences = calculateDifferences();
  
  // If no revisions, show placeholder
  if (revisions.length === 0) {
    return (
      <div className="text-center p-6 border rounded-md bg-slate-50">
        <p className="text-muted-foreground">No revision history available</p>
      </div>
    );
  }

  // Find current revision
  const currentRevision = revisions.find(rev => rev.id === currentRevisionId);
  
  // Helper to get trend icon for financial changes
  const getTrendIcon = (diff: number | undefined) => {
    if (!diff) return <Minus className="h-3.5 w-3.5" />;
    if (diff > 0) return <TrendingUp className="h-3.5 w-3.5 text-green-500" />;
    if (diff < 0) return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
    return <Minus className="h-3.5 w-3.5 text-gray-500" />;
  };
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Revision History</h3>
        {currentRevision && (
          <div className="text-xs text-muted-foreground">
            Current: Version {currentRevision.version}
          </div>
        )}
      </div>
      
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-[12px] top-6 bottom-6 w-[2px] bg-gray-200"></div>
        
        <div className="space-y-2.5">
          {sortedRevisions.map((revision, index) => {
            const isCurrentRevision = currentRevisionId === revision.id;
            const diff = differences[revision.id];
            
            return (
              <div 
                key={revision.id} 
                className={cn(
                  "relative flex p-3 pl-8 rounded-md border transition-all cursor-pointer",
                  isCurrentRevision 
                    ? "border-[#0485ea] bg-blue-50/50 shadow-sm" 
                    : "border-gray-200 hover:bg-slate-50"
                )}
                onClick={() => onSelectRevision(revision.id)}
              >
                {/* Timeline dot */}
                <div className={cn(
                  "absolute left-[6px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center z-10",
                  isCurrentRevision ? "bg-[#0485ea]" : "bg-gray-200"
                )}>
                  {isCurrentRevision && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-[#0485ea] opacity-75"></span>
                  )}
                  {/* Financial trend icon (inside the dot) */}
                  {diff && !isCurrentRevision && (
                    <span className="text-white scale-75">
                      {getTrendIcon(diff.amount)}
                    </span>
                  )}
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
                  
                  <div className="flex items-center justify-between mt-1.5">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-sm font-medium flex items-center">
                            {formatCurrency(revision.amount || 0)}
                            {diff && (
                              <span className={cn(
                                "ml-1.5 text-xs font-normal flex items-center",
                                diff.amount > 0 ? "text-green-600" : diff.amount < 0 ? "text-red-600" : "text-gray-500"
                              )}>
                                {getTrendIcon(diff.amount)}
                                <span className="ml-0.5">
                                  {diff.amount > 0 ? "+" : ""}{formatCurrency(diff.amount)}
                                </span>
                              </span>
                            )}
                          </div>
                        </TooltipTrigger>
                        {diff && (
                          <TooltipContent side="top">
                            <div className="text-xs">
                              <div className={diff.amount > 0 ? "text-green-600" : "text-red-600"}>
                                {diff.percentage > 0 ? "+" : ""}{diff.percentage}% 
                              </div>
                              <div className="text-muted-foreground">
                                from version {sortedRevisions[index + 1]?.version || 'unknown'}
                              </div>
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                    
                    <div className="flex items-center">
                      {getStatusIcon(revision.status)}
                    </div>
                  </div>
                  
                  {revision.notes && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-xs text-gray-600 mt-1.5 line-clamp-1">{revision.notes}</div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-sm">
                          <p className="text-xs">{revision.notes}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {!isCurrentRevision && (
                    <div className="mt-1.5">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-xs px-2 text-[#0485ea]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRevision(revision.id);
                        }}
                      >
                        Switch to this version
                        <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EstimateRevisionTimeline;
