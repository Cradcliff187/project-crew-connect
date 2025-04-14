import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Subcontractor } from '../utils/types';

interface ContactInformationCardProps {
  subcontractor: Subcontractor;
}

const ContactInformationCard = ({ subcontractor }: ContactInformationCardProps) => {
  return (
    <div>
      <h3 className="text-lg font-montserrat font-semibold mb-3 text-[#0485ea]">
        Contact Information
      </h3>
      <div className="space-y-3">
        {subcontractor.subname && (
          <div className="text-foreground">
            <span className="font-medium">Contact Name:</span>
            <div className="text-foreground">{subcontractor.subname}</div>
          </div>
        )}

        {subcontractor.contactemail && (
          <div className="flex items-start gap-2">
            <Mail className="h-4 w-4 mt-1 text-[#0485ea]" />
            <div>
              <span className="font-medium">Email:</span>
              <div>
                <a
                  href={`mailto:${subcontractor.contactemail}`}
                  className="text-[#0485ea] hover:text-[#0375d1] hover:underline"
                >
                  {subcontractor.contactemail}
                </a>
              </div>
            </div>
          </div>
        )}

        {subcontractor.phone && (
          <div className="flex items-start gap-2">
            <Phone className="h-4 w-4 mt-1 text-[#0485ea]" />
            <div>
              <span className="font-medium">Phone:</span>
              <div className="text-foreground">
                <a href={`tel:${subcontractor.phone}`} className="hover:text-[#0485ea]">
                  {subcontractor.phone}
                </a>
              </div>
            </div>
          </div>
        )}

        {(subcontractor.address ||
          subcontractor.city ||
          subcontractor.state ||
          subcontractor.zip) && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-1 text-[#0485ea]" />
            <div>
              <span className="font-medium">Address:</span>
              <div className="text-foreground">
                {subcontractor.address && <div>{subcontractor.address}</div>}
                {(subcontractor.city || subcontractor.state || subcontractor.zip) && (
                  <div>
                    {[subcontractor.city, subcontractor.state, subcontractor.zip]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                )}
              </div>
            </div>
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
      </div>
    </div>
  );
};

export default ContactInformationCard;
