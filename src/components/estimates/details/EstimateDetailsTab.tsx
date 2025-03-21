
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type EstimateDetailsTabProps = {
  estimate: {
    project: string;
    client: string;
    description?: string;
    amount: number;
    location?: {
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
  };
};

const EstimateDetailsTab: React.FC<EstimateDetailsTabProps> = ({ estimate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-muted-foreground">Project:</span>
            <p className="font-medium">{estimate.project}</p>
          </div>
          {estimate.description && (
            <div>
              <span className="text-muted-foreground">Description:</span>
              <p>{estimate.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-muted-foreground">Client:</span>
            <p className="font-medium">{estimate.client}</p>
          </div>
          {estimate.location && (
            <div>
              <span className="text-muted-foreground">Location:</span>
              {estimate.location.address && <p>{estimate.location.address}</p>}
              {(estimate.location.city || estimate.location.state || estimate.location.zip) && (
                <p>
                  {estimate.location.city && `${estimate.location.city}, `}
                  {estimate.location.state && `${estimate.location.state} `}
                  {estimate.location.zip && estimate.location.zip}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Financial Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-muted-foreground">Total Amount:</span>
            <p className="font-medium text-xl">{formatCurrency(estimate.amount)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EstimateDetailsTab;
