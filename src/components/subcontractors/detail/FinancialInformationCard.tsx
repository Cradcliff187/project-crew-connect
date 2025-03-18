
import React from 'react';
import { Clock, DollarSign, FileText } from 'lucide-react';
import { getPaymentTermsLabel, Subcontractor } from '../utils/subcontractorUtils';

interface FinancialInformationCardProps {
  subcontractor: Subcontractor;
}

const FinancialInformationCard = ({ subcontractor }: FinancialInformationCardProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Financial Information</h3>
      <div className="space-y-2">
        {subcontractor.payment_terms && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Payment Terms: {getPaymentTermsLabel(subcontractor.payment_terms)}</span>
          </div>
        )}
        {subcontractor.hourly_rate && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>Hourly Rate: ${subcontractor.hourly_rate}</span>
          </div>
        )}
        {subcontractor.tax_id && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>Tax ID: {subcontractor.tax_id}</span>
          </div>
        )}
        {subcontractor.total_completed_amount > 0 && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>Total Completed: ${subcontractor.total_completed_amount.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialInformationCard;
