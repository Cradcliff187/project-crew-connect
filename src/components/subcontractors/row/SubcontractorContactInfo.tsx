
import React from 'react';
import { Subcontractor } from '../utils/subcontractorUtils';

interface SubcontractorContactInfoProps {
  subcontractor: Subcontractor;
}

const SubcontractorContactInfo = ({ subcontractor }: SubcontractorContactInfoProps) => {
  return (
    <>
      {subcontractor.contactemail && (
        <div className="text-sm">{subcontractor.contactemail}</div>
      )}
      {subcontractor.phone && (
        <div className="text-sm">{subcontractor.phone}</div>
      )}
      {subcontractor.tax_id && (
        <div className="text-xs text-muted-foreground">Tax ID: {subcontractor.tax_id}</div>
      )}
    </>
  );
};

export default SubcontractorContactInfo;
