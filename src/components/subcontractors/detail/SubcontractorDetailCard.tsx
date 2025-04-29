import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Subcontractor } from '../utils/types';
import { getPaymentTermsLabel } from '../utils/performanceUtils';

interface SubcontractorDetailCardProps {
  subcontractor: Subcontractor;
}

const SubcontractorDetailCard: React.FC<SubcontractorDetailCardProps> = ({ subcontractor }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl text-primary">{subcontractor.subname}</CardTitle>
            <CardDescription className="mt-1 text-muted-foreground">
              {subcontractor.subid}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subcontractor.tax_id && (
            <div>
              <p className="text-sm font-medium">Tax ID</p>
              <p>{subcontractor.tax_id}</p>
            </div>
          )}
          {subcontractor.payment_terms && (
            <div>
              <p className="text-sm font-medium">Payment Terms</p>
              <p>{getPaymentTermsLabel(subcontractor.payment_terms)}</p>
            </div>
          )}
          {subcontractor.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium">Notes</p>
                <p className="whitespace-pre-wrap">{subcontractor.notes}</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubcontractorDetailCard;
