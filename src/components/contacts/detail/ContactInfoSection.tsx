import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Mail, Phone, Building2, Calendar } from 'lucide-react';
import { Contact } from '@/pages/Contacts';
import { format } from 'date-fns';

interface ContactInfoSectionProps {
  contact: Contact;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({ contact }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contact.email && (
            <div className="flex items-start">
              <Mail className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{contact.email}</p>
              </div>
            </div>
          )}

          {contact.phone && (
            <div className="flex items-start">
              <Phone className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{contact.phone}</p>
              </div>
            </div>
          )}

          {contact.company && (
            <div className="flex items-start">
              <Building2 className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Company</p>
                <p className="text-sm text-muted-foreground">{contact.company}</p>
              </div>
            </div>
          )}

          {contact.role && (
            <div className="flex items-start">
              <Building2 className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Role</p>
                <p className="text-sm text-muted-foreground">{contact.role}</p>
              </div>
            </div>
          )}
        </div>

        {(contact.address || contact.city || contact.state || contact.zip) && (
          <div className="pt-2">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Address</p>
                <div className="text-sm text-muted-foreground">
                  {contact.address && <p>{contact.address}</p>}
                  {(contact.city || contact.state || contact.zip) && (
                    <p>
                      {contact.city && `${contact.city}, `}
                      {contact.state && `${contact.state} `}
                      {contact.zip && contact.zip}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {contact.lastContact && (
          <div className="pt-2">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Last Contact</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(contact.lastContact), 'PPP')}
                </p>
              </div>
            </div>
          </div>
        )}

        {contact.notes && (
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium mb-1">Notes</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{contact.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactInfoSection;
