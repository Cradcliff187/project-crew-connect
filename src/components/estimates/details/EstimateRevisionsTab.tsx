
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { EstimateRevision } from '../types/estimateTypes';
import { formatDate as defaultFormatDate } from '@/lib/utils';

type EstimateRevisionsTabProps = {
  revisions: EstimateRevision[];
  estimateId?: string; // Making this optional so it doesn't break existing code
  formatDate?: (dateString: string) => string;
};

const EstimateRevisionsTab: React.FC<EstimateRevisionsTabProps> = ({ 
  revisions, 
  estimateId,
  formatDate = defaultFormatDate // Use the formatDate from utils as default
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revision History</CardTitle>
        <CardDescription>Track changes to this estimate over time</CardDescription>
      </CardHeader>
      <CardContent>
        {revisions.length > 0 ? (
          <div className="space-y-6">
            {revisions.map((revision) => (
              <div key={revision.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Version {revision.version}</h4>
                  <span className="text-sm text-muted-foreground">{formatDate(revision.revision_date)}</span>
                </div>
                {revision.notes && <p className="text-sm mb-2">{revision.notes}</p>}
                {revision.amount && (
                  <p className="text-sm font-medium">
                    Amount: {formatCurrency(revision.amount)}
                  </p>
                )}
                {revision.revision_by && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Revised by: {revision.revision_by}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No revision history available for this estimate.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimateRevisionsTab;
