import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Subcontractor } from '../utils/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ContactInformationCardProps {
  subcontractor: Subcontractor;
}

const ContactInformationCard = ({ subcontractor }: ContactInformationCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <MapPin className="h-5 w-5" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {subcontractor.subname && (
          <div>
            <p className="text-sm font-medium">Contact Name</p>
            <p>{subcontractor.subname}</p>
          </div>
        )}

        {subcontractor.contactemail && (
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a
                href={`mailto:${subcontractor.contactemail}`}
                className="text-primary hover:text-primary/90 hover:underline"
              >
                {subcontractor.contactemail}
              </a>
            </p>
          </div>
        )}

        {subcontractor.phone && (
          <div>
            <p className="text-sm font-medium">Phone</p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <a href={`tel:${subcontractor.phone}`} className="hover:text-primary">
                {subcontractor.phone}
              </a>
            </p>
          </div>
        )}

        {(subcontractor.address ||
          subcontractor.city ||
          subcontractor.state ||
          subcontractor.zip) && (
          <div>
            <p className="text-sm font-medium">Address</p>
            {subcontractor.address && <p>{subcontractor.address}</p>}
            {(subcontractor.city || subcontractor.state || subcontractor.zip) && (
              <p>
                {[subcontractor.city, subcontractor.state, subcontractor.zip]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
          </div>
        )}

        {!subcontractor.contactemail &&
          !subcontractor.phone &&
          !subcontractor.address &&
          !subcontractor.city &&
          !subcontractor.state &&
          !subcontractor.zip && (
            <div className="text-muted-foreground italic">No contact information available</div>
          )}
      </CardContent>
    </Card>
  );
};

export default ContactInformationCard;
