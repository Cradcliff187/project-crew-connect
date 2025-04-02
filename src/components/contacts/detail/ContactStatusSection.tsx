
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Contact } from '@/pages/Contacts';
import StatusDropdown from './StatusDropdown';
import { getStatusOptions } from './util/statusTransitions';

interface ContactStatusSectionProps {
  contact: Contact;
  onStatusChange: () => void; // This function doesn't take a parameter
}

const ContactStatusSection: React.FC<ContactStatusSectionProps> = ({ contact, onStatusChange }) => {
  // Use contact's type to determine available status options
  const contactType = contact.type?.toLowerCase() || '';
  
  // Get appropriate status options based on contact type and current status
  const statusOptions = getStatusOptions(contactType, contact.status || '');
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Status & Classification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Contact Type</h3>
          <div className="p-2 bg-muted rounded-md">
            {contact.type ? (
              <span className="capitalize">{contact.type.toLowerCase()}</span>
            ) : (
              <span className="text-muted-foreground">Not specified</span>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Current Status</h3>
          <StatusDropdown 
            contact={contact} 
            onStatusChange={onStatusChange} 
            statusOptions={statusOptions}
          />
        </div>
        
        {contact.specialty && (
          <div>
            <h3 className="text-sm font-medium mb-2">Specialty</h3>
            <div className="p-2 bg-muted rounded-md">
              {contact.specialty}
            </div>
          </div>
        )}
        
        {contact.rating !== undefined && contact.rating !== null && (
          <div>
            <h3 className="text-sm font-medium mb-2">Rating</h3>
            <div className="p-2 bg-muted rounded-md">
              {contact.rating} / 5
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactStatusSection;
