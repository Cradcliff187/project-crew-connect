
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

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
        year: 'numeric' 
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

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Estimate Information</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Estimate ID:</span>
              <span className="font-medium">{estimate.id}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Date Created:</span>
              <span className="font-medium">{formatDate(estimate.date)}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">{formatCurrency(estimate.amount)}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium capitalize">{estimate.status}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Total Revisions:</span>
              <span className="font-medium">{estimate.versions}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Client & Project Details</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Client:</span>
              <span className="font-medium">{estimate.client}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Project:</span>
              <span className="font-medium">{estimate.project}</span>
            </div>
            {estimate.location && (
              <div className="grid grid-cols-2">
                <span className="text-muted-foreground">Location:</span>
                <div className="font-medium">
                  {estimate.location.address && <div>{estimate.location.address}</div>}
                  {(estimate.location.city || estimate.location.state || estimate.location.zip) && (
                    <div>
                      {estimate.location.city && `${estimate.location.city}, `}
                      {estimate.location.state && `${estimate.location.state} `}
                      {estimate.location.zip && estimate.location.zip}
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
            <h3 className="text-lg font-medium mb-4">Description</h3>
            <p className="whitespace-pre-wrap text-gray-700">{estimate.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EstimateDetailsTab;
