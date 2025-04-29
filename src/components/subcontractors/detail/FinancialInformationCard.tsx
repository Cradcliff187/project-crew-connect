import React from 'react';
import { Clock, DollarSign, FileText } from 'lucide-react';
import { getPaymentTermsLabel } from '../utils/performanceUtils';
import { Subcontractor } from '../utils/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

interface FinancialInformationCardProps {
  subcontractor: Subcontractor;
}

const FinancialInformationCard = ({ subcontractor }: FinancialInformationCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-primary">Financial Information</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          {subcontractor.payment_terms && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#0485ea]" />
              <span>Payment Terms: {getPaymentTermsLabel(subcontractor.payment_terms)}</span>
            </div>
          )}
          {subcontractor.hourly_rate !== null && subcontractor.hourly_rate !== undefined && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#0485ea]" />
              <span>Hourly Rate: ${subcontractor.hourly_rate}</span>
            </div>
          )}
          {subcontractor.tax_id && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#0485ea]" />
              <span>Tax ID: {subcontractor.tax_id}</span>
            </div>
          )}

          {!subcontractor.payment_terms && !subcontractor.hourly_rate && !subcontractor.tax_id && (
            <div className="text-muted-foreground italic">No financial information available</div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FinancialInformationCard;
