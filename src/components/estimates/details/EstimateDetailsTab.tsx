
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { CalendarIcon, DollarSignIcon, ClipboardIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EstimateDetailsTabProps {
  estimate: {
    id: string;
    client: string;
    project?: string;
    description?: string;
    date: string;
    status: string;
    amount: number;
    versions?: number;
  };
}

const EstimateDetailsTab: React.FC<EstimateDetailsTabProps> = ({ estimate }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }).format(date);
    } catch (error) {
      return dateString || 'Not set';
    }
  };

  const getStatusColor = (status: string): string => {
    const statusMap: Record<string, string> = {
      'draft': 'bg-gray-500',
      'pending': 'bg-yellow-500',
      'sent': 'bg-blue-500',
      'approved': 'bg-green-500',
      'rejected': 'bg-red-500',
      'converted': 'bg-purple-500',
      'archived': 'bg-gray-400',
    };
    
    return statusMap[status.toLowerCase()] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                  <ClipboardIcon className="h-4 w-4 mr-1" /> Client
                </h3>
                <p className="text-base">{estimate.client}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" /> Date Created
                </h3>
                <p className="text-base">{formatDate(estimate.date)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                  <DollarSignIcon className="h-4 w-4 mr-1" /> Amount
                </h3>
                <p className="text-base font-semibold">{formatCurrency(estimate.amount)}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Project</h3>
                <p className="text-base">{estimate.project || 'No project assigned'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                <Badge className={`${getStatusColor(estimate.status)} text-white`}>
                  {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Versions</h3>
                <p className="text-base">{estimate.versions || 1}</p>
              </div>
            </div>
          </div>
          
          {estimate.description && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p className="text-base whitespace-pre-line">{estimate.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EstimateDetailsTab;
