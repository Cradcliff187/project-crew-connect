import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

type EstimateDetailsTabProps = {
  estimate: {
    id: string;
    client: string;
    project: string;
    date: string;
    amount: number;
    status: string;
    versions: number;
    location?: {
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
    description?: string;
  };
};

const EstimateDetailsTab: React.FC<EstimateDetailsTabProps> = ({ estimate }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Check if we have valid location data to display
  const hasLocationData =
    estimate.location &&
    (estimate.location.address ||
      estimate.location.city ||
      estimate.location.state ||
      estimate.location.zip);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4 font-montserrat">Estimate Information</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground font-opensans">Estimate ID:</span>
              <span className="font-medium font-opensans">{estimate.id}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground font-opensans">Date Created:</span>
              <span className="font-medium font-opensans">{formatDate(estimate.date)}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground font-opensans">Amount:</span>
              <span className="font-medium font-opensans">{formatCurrency(estimate.amount)}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground font-opensans">Status:</span>
              <span className="font-medium capitalize font-opensans">{estimate.status}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground font-opensans">Total Revisions:</span>
              <span className="font-medium font-opensans">{estimate.versions}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4 font-montserrat">Client & Project Details</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground font-opensans">Client:</span>
              <span className="font-medium font-opensans">{estimate.client}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground font-opensans">Project:</span>
              <span className="font-medium font-opensans">{estimate.project}</span>
            </div>
            {hasLocationData && (
              <div className="grid grid-cols-2">
                <span className="text-muted-foreground font-opensans">Location:</span>
                <div className="font-medium font-opensans">
                  {estimate.location?.address && <div>{estimate.location.address}</div>}
                  {(estimate.location?.city ||
                    estimate.location?.state ||
                    estimate.location?.zip) && (
                    <div>
                      {estimate.location?.city && `${estimate.location.city}, `}
                      {estimate.location?.state && `${estimate.location.state} `}
                      {estimate.location?.zip && estimate.location.zip}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {estimate.description && (
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4 font-montserrat">Description</h3>
            <p className="whitespace-pre-wrap text-gray-700 font-opensans">
              {estimate.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EstimateDetailsTab;
