
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { formatSubcontractorAddress } from '../utils/formatUtils';
import { Subcontractor } from '../utils/types';

interface ContactInformationCardProps {
  subcontractor: Subcontractor;
}

const ContactInformationCard = ({ subcontractor }: ContactInformationCardProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Contact Information</h3>
      <div className="space-y-2">
        {subcontractor.contactemail && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{subcontractor.contactemail}</span>
          </div>
        )}
        {subcontractor.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{subcontractor.phone}</span>
          </div>
        )}
        {formatSubcontractorAddress(subcontractor) && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="whitespace-pre-line">{formatSubcontractorAddress(subcontractor)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactInformationCard;
