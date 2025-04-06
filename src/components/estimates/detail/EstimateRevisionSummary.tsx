
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { EstimateRevision } from '../types/estimateTypes';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EstimateRevisionSummaryProps {
  revision: EstimateRevision | null;
  previousRevision?: EstimateRevision | null;
  showComparison?: boolean;
}

const EstimateRevisionSummary: React.FC<EstimateRevisionSummaryProps> = ({
  revision,
  previousRevision = null,
  showComparison = true
}) => {
  if (!revision) {
    return <div className="text-muted-foreground text-sm">No revision available</div>;
  }
  
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
        return 'bg-green-100 text-green-800 border-green-300';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  const calculateDifference = () => {
    if (!previousRevision || previousRevision.amount === undefined || revision.amount === undefined) {
      return null;
    }
    
    const diff = revision.amount - previousRevision.amount;
    if (diff === 0) return null;
    
    const percentage = previousRevision.amount !== 0 
      ? ((diff / previousRevision.amount) * 100)
      : 0;
      
    return {
      amount: diff,
      percentage: Math.round(percentage * 10) / 10,
      isPositive: diff > 0
    };
  };
  
  const difference = calculateDifference();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
      <div className="flex items-center">
        <Badge variant="outline" className="bg-[#0485ea]/10 text-[#0485ea] border-[#0485ea]/20">
          Version {revision.version}
        </Badge>
        
        {revision.is_current && (
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
      
      <div className="text-sm text-muted-foreground">
        {formatDate(revision.revision_date)}
      </div>
      
      <div className="flex items-center ml-auto">
        <span className="font-medium">{formatCurrency(revision.amount || 0)}</span>
        
        {showComparison && difference && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span 
                  className={`ml-2 text-xs ${difference.isPositive ? 'text-green-600' : 'text-red-600'}`}
                >
                  {difference.isPositive ? '+' : ''}{formatCurrency(difference.amount)} 
                  ({difference.percentage > 0 ? '+' : ''}{difference.percentage}%)
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Compared to version {previousRevision?.version}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default EstimateRevisionSummary;
