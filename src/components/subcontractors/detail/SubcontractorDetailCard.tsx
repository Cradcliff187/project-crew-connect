import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Building } from 'lucide-react';
import { Subcontractor } from '../utils/types';
import { getPaymentTermsLabel } from '../utils/performanceUtils';

interface SubcontractorDetailCardProps {
  subcontractor: Subcontractor;
}

const SubcontractorDetailCard: React.FC<SubcontractorDetailCardProps> = ({ subcontractor }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Building className="h-5 w-5" />
          Subcontractor Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Subcontractor ID</p>
          <p>{subcontractor.subid}</p>
        </div>

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
      </CardContent>
    </Card>
  );
};

export default SubcontractorDetailCard;
