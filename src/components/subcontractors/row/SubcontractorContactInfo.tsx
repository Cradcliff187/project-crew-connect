
import React from 'react';
import { Subcontractor } from '../utils/types';
import { Mail, Phone } from 'lucide-react';

interface SubcontractorContactInfoProps {
  subcontractor: Subcontractor;
}

const SubcontractorContactInfo = ({ subcontractor }: SubcontractorContactInfoProps) => {
  return (
    <div className="flex flex-col gap-1">
      {subcontractor.contactemail && (
        <div className="flex items-center gap-1">
          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm">{subcontractor.contactemail}</span>
        </div>
      )}
      {subcontractor.phone && (
        <div className="flex items-center gap-1">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm">{subcontractor.phone}</span>
        </div>
      )}
      {!subcontractor.contactemail && !subcontractor.phone && (
        <div className="text-xs text-muted-foreground">No contact information</div>
      )}
      {subcontractor.tax_id && (
        <div className="text-xs text-muted-foreground mt-1">Tax ID: {subcontractor.tax_id}</div>
      )}
    </div>
  );
};

export default SubcontractorContactInfo;
