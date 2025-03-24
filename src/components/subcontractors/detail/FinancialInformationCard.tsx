
import React from 'react';
import { Clock, DollarSign, FileText } from 'lucide-react';
import { getPaymentTermsLabel } from '../utils/performanceUtils';
import { Subcontractor } from '../utils/types';

interface FinancialInformationCardProps {
  subcontractor: Subcontractor;
}

const FinancialInformationCard = ({ subcontractor }: FinancialInformationCardProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-montserrat font-semibold text-[#0485ea]">Financial Information</h3>
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
  );
};

export default FinancialInformationCard;
