
import React from 'react';
import { Contact } from '@/pages/Contacts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusColorClass, getStatusDisplayName } from '@/utils/statusTransitions';
import StatusDropdown from './StatusDropdown';
import ContactStatusHistory from '../ContactStatusHistory';

interface ContactStatusSectionProps {
  contact: Contact;
  onStatusChange: (contact: Contact, newStatus: string) => void;
}

const ContactStatusSection: React.FC<ContactStatusSectionProps> = ({
  contact,
  onStatusChange
}) => {
  const currentStatus = contact.status || 'PROSPECT';
  
  // Status descriptions for each contact status
  const getStatusDescription = (status: string): string => {
    switch (status.toUpperCase()) {
      case 'PROSPECT':
        return "This contact is a prospect and has not yet engaged in business with your company.";
      case 'ACTIVE':
        return "This contact is actively engaged with your company.";
      case 'INACTIVE':
        return "This contact is currently inactive and not actively engaged.";
      default:
        return "Status information not available.";
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-lg">Contact Status</CardTitle>
          <StatusDropdown 
            contact={contact} 
            onStatusChange={onStatusChange} 
          />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge className={getStatusColorClass('CONTACT', currentStatus)}>
              {getStatusDisplayName('CONTACT', currentStatus)}
            </Badge>
            
            <div className="text-sm text-muted-foreground">
              {getStatusDescription(currentStatus)}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <ContactStatusHistory 
        contact={contact}
      />
    </div>
  );
};

export default ContactStatusSection;
