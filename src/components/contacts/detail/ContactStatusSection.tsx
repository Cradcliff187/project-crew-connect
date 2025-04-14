import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Contact } from '@/pages/Contacts';
import StatusDropdown from './StatusDropdown';
import { getStatusOptions } from './util/statusTransitions';
import { Button } from '@/components/ui/button';
import { UserRound } from 'lucide-react';
import TypeTransitionDialog from './TypeTransitionDialog';
import { transitionContactType } from './util/contactTransitions';
import { toast } from '@/hooks/use-toast';

interface ContactStatusSectionProps {
  contact: Contact;
  onStatusChange: () => void;
}

const ContactStatusSection: React.FC<ContactStatusSectionProps> = ({ contact, onStatusChange }) => {
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const contactType = contact.type?.toLowerCase() || '';

  // Get appropriate status options based on contact type and current status
  const statusOptions = getStatusOptions(contactType, contact.status || '');

  const handleTypeChange = async (newType: string) => {
    try {
      const success = await transitionContactType(contact, newType);

      if (success) {
        toast({
          title: 'Contact Type Updated',
          description: `Contact has been converted to ${newType}.`,
          className: 'bg-[#0485ea]',
        });
        onStatusChange(); // Refresh data using parent callback
      }
    } catch (error) {
      console.error('Error changing contact type:', error);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Status & Classification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium mb-2">Contact Type</h3>
            <div className="p-2 bg-muted rounded-md flex">
              {contact.type ? (
                <span className="capitalize">{contact.type.toLowerCase()}</span>
              ) : (
                <span className="text-muted-foreground">Not specified</span>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTypeDialogOpen(true)}
            className="h-8 px-2"
          >
            <UserRound className="h-3.5 w-3.5 mr-1" />
            Change Type
          </Button>
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
            <div className="p-2 bg-muted rounded-md">{contact.specialty}</div>
          </div>
        )}

        {contact.rating !== undefined && contact.rating !== null && (
          <div>
            <h3 className="text-sm font-medium mb-2">Rating</h3>
            <div className="p-2 bg-muted rounded-md">{contact.rating} / 5</div>
          </div>
        )}
      </CardContent>

      <TypeTransitionDialog
        open={typeDialogOpen}
        onOpenChange={setTypeDialogOpen}
        contact={contact}
        onTypeChange={handleTypeChange}
        onSuccess={onStatusChange}
      />
    </Card>
  );
};

export default ContactStatusSection;
