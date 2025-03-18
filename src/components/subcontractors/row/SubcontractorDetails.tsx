
import React from 'react';
import { Subcontractor, getPaymentTermsLabel, getRatingDisplay } from '../utils/subcontractorUtils';
import { format } from 'date-fns';

interface SubcontractorDetailsProps {
  subcontractor: Subcontractor;
}

const SubcontractorDetails = ({ subcontractor }: SubcontractorDetailsProps) => {
  // Format created_at date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <>
      <div className="text-sm">{formatDate(subcontractor.created_at)}</div>
      <div className="text-xs text-muted-foreground">
        {subcontractor.payment_terms && `Terms: ${getPaymentTermsLabel(subcontractor.payment_terms)}`}
      </div>
      {subcontractor.hourly_rate && (
        <div className="text-xs text-muted-foreground">
          Rate: ${subcontractor.hourly_rate}/hr
        </div>
      )}
      {subcontractor.rating && (
        <div className="text-xs text-amber-500">
          {getRatingDisplay(subcontractor.rating)}
        </div>
      )}
    </>
  );
};

export default SubcontractorDetails;
