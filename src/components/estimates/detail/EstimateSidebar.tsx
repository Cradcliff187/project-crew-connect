import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Calendar, MapPin, AlertCircle, User, Phone, Mail, Share2 } from 'lucide-react';
import EstimateRevisionTimeline from './EstimateRevisionTimeline';
import { EstimateRevision } from '../types/estimateTypes';

interface EstimateSidebarProps {
  estimate: {
    estimateid: string;
    customerid?: string;
    customername?: string;
    contactemail?: string;
    status: string;
    datecreated?: string;
    estimateamount: number;
    sitelocationaddress?: string;
    sitelocationcity?: string;
    sitelocationstate?: string;
    sitelocationzip?: string;
  };
  revisions: EstimateRevision[];
  currentRevisionId?: string;
  onRevisionSelect: (revisionId: string) => void;
  onShare: () => void;
}

const EstimateSidebar: React.FC<EstimateSidebarProps> = ({
  estimate,
  revisions,
  currentRevisionId,
  onRevisionSelect,
  onShare,
}) => {
  // Helper to get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'converted':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Helper to format address
  const formatAddress = () => {
    const address = [];

    if (estimate.sitelocationaddress) address.push(estimate.sitelocationaddress);

    const cityStateZip = [
      estimate.sitelocationcity,
      estimate.sitelocationstate,
      estimate.sitelocationzip,
    ]
      .filter(Boolean)
      .join(', ');

    if (cityStateZip) address.push(cityStateZip);

    return address.join(', ') || 'No location specified';
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-medium">Estimate Overview</CardTitle>
            <Badge variant="outline" className={`${getStatusColor(estimate.status)}`}>
              {estimate.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Estimate Amount</div>
              <div className="text-xl font-bold">{formatCurrency(estimate.estimateamount)}</div>
            </div>

            <div className="pt-1 space-y-3">
              {estimate.customername && (
                <div className="flex items-start">
                  <User className="h-4 w-4 mt-0.5 text-muted-foreground mr-2" />
                  <div>
                    <div className="text-sm font-medium">{estimate.customername}</div>
                    <div className="text-xs text-muted-foreground">Customer</div>
                  </div>
                </div>
              )}

              {estimate.contactemail && (
                <div className="flex items-start">
                  <Mail className="h-4 w-4 mt-0.5 text-muted-foreground mr-2" />
                  <div>
                    <div className="text-sm">{estimate.contactemail}</div>
                    <div className="text-xs text-muted-foreground">Contact Email</div>
                  </div>
                </div>
              )}

              {estimate.datecreated && (
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground mr-2" />
                  <div>
                    <div className="text-sm">{formatDate(estimate.datecreated)}</div>
                    <div className="text-xs text-muted-foreground">Date Created</div>
                  </div>
                </div>
              )}

              {(estimate.sitelocationaddress || estimate.sitelocationcity) && (
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground mr-2" />
                  <div>
                    <div className="text-sm">{formatAddress()}</div>
                    <div className="text-xs text-muted-foreground">Location</div>
                  </div>
                </div>
              )}
            </div>

            <Button variant="outline" size="sm" className="w-full text-xs" onClick={onShare}>
              <Share2 className="h-3.5 w-3.5 mr-1" />
              Share Estimate
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Revision History</CardTitle>
        </CardHeader>
        <CardContent>
          <EstimateRevisionTimeline
            revisions={revisions}
            currentRevisionId={currentRevisionId}
            onSelectRevision={onRevisionSelect}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default EstimateSidebar;
