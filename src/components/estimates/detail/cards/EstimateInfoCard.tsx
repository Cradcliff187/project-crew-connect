
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { DollarSign, Calendar, FileText, MapPin } from 'lucide-react';

interface EstimateInfoCardProps {
  data: {
    customername?: string;
    customerid?: string;
    projectname?: string;
    datecreated?: string;
    sentdate?: string;
    approveddate?: string;
    estimateamount: number;
    contingencyamount?: number;
    contingency_percentage?: number;
    sitelocationaddress?: string;
    sitelocationcity?: string;
    sitelocationstate?: string;
    sitelocationzip?: string;
  };
}

const EstimateInfoCard: React.FC<EstimateInfoCardProps> = ({ data }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if we have valid location data to display
  const hasLocationData = data.sitelocationaddress || 
                         data.sitelocationcity || 
                         data.sitelocationstate || 
                         data.sitelocationzip;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Estimate Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium text-sm text-gray-500 mb-1 flex items-center">
            <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
            Amount
          </h3>
          <p className="text-lg font-semibold">${data.estimateamount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          {data.contingencyamount && data.contingency_percentage && (
            <p className="text-sm text-gray-500">
              Includes {data.contingency_percentage}% contingency (${data.contingencyamount.toLocaleString('en-US', { minimumFractionDigits: 2 })})
            </p>
          )}
        </div>
        
        <div>
          <h3 className="font-medium text-sm text-gray-500 mb-1 flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
            Date Information
          </h3>
          <dl className="space-y-1">
            <div className="flex justify-between">
              <dt className="text-sm">Created:</dt>
              <dd className="text-sm font-medium">{formatDate(data.datecreated)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm">Sent:</dt>
              <dd className="text-sm font-medium">{formatDate(data.sentdate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm">Approved:</dt>
              <dd className="text-sm font-medium">{formatDate(data.approveddate)}</dd>
            </div>
          </dl>
        </div>
        
        <div>
          <h3 className="font-medium text-sm text-gray-500 mb-1 flex items-center">
            <FileText className="h-4 w-4 mr-1 text-gray-400" />
            Client & Project
          </h3>
          <dl className="space-y-1">
            <div className="flex justify-between">
              <dt className="text-sm">Client:</dt>
              <dd className="text-sm font-medium">{data.customername || data.customerid || 'Not specified'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm">Project:</dt>
              <dd className="text-sm font-medium">{data.projectname || 'Not linked'}</dd>
            </div>
          </dl>
        </div>
        
        {hasLocationData && (
          <div>
            <h3 className="font-medium text-sm text-gray-500 mb-1 flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
              Location
            </h3>
            <address className="not-italic text-sm">
              {data.sitelocationaddress && <div>{data.sitelocationaddress}</div>}
              {(data.sitelocationcity || data.sitelocationstate || data.sitelocationzip) && (
                <div>
                  {data.sitelocationcity && `${data.sitelocationcity}, `}
                  {data.sitelocationstate && `${data.sitelocationstate} `}
                  {data.sitelocationzip && data.sitelocationzip}
                </div>
              )}
            </address>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimateInfoCard;
