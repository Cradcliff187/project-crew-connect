import React from 'react';
import { EstimateRevision } from '../types/estimateTypes';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface EstimateRevisionSummaryProps {
  revision: EstimateRevision;
  previousRevision?: EstimateRevision | null;
}

const EstimateRevisionSummary: React.FC<EstimateRevisionSummaryProps> = ({
  revision,
  previousRevision,
}) => {
  // Helper function to get status icon
  const getStatusIcon = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sent':
        return <Clock className="h-4 w-4 text-[#0485ea]" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
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

  // Calculate change percentage
  const calculateChange = () => {
    if (!previousRevision || !previousRevision.amount || !revision.amount) {
      return null;
    }

    const difference = revision.amount - previousRevision.amount;
    const percentage = ((difference / previousRevision.amount) * 100).toFixed(1);

    return {
      amount: difference,
      percentage: parseFloat(percentage),
      isIncrease: difference > 0,
    };
  };

  const change = calculateChange();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-[#0485ea]/10 text-[#0485ea] border-[#0485ea]/20">
            Version {revision.version}
          </Badge>

          <Badge variant="outline" className={`${getStatusColor(revision.status)}`}>
            <span className="flex items-center">
              {getStatusIcon(revision.status)}
              <span className="ml-1 uppercase text-xs">{revision.status || 'Draft'}</span>
            </span>
          </Badge>
        </div>

        <div className="font-medium">{formatCurrency(revision.amount || 0)}</div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <div className="text-xs text-muted-foreground">Date</div>
          <div>{formatDate(revision.revision_date)}</div>
        </div>

        {change && (
          <div className="text-right">
            <div className="text-xs text-muted-foreground">
              Change from v{previousRevision?.version}
            </div>
            <div className={change.isIncrease ? 'text-green-600' : 'text-red-600'}>
              {change.isIncrease ? '+' : ''}
              {formatCurrency(change.amount)} ({change.isIncrease ? '+' : ''}
              {change.percentage}%)
            </div>
          </div>
        )}
      </div>

      {revision.notes && (
        <div className="mt-2 text-xs">
          <div className="text-muted-foreground mb-0.5">Notes</div>
          <div className="bg-slate-50 p-2 rounded-sm border border-slate-100">{revision.notes}</div>
        </div>
      )}
    </div>
  );
};

export default EstimateRevisionSummary;
