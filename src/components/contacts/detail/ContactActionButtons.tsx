
import { Mail, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusDropdown from './StatusDropdown';
import { getStatusOptions } from './util/statusTransitions';

interface ContactActionButtonsProps {
  contact: any;
  onStatusChange?: (contact: any, newStatus: string) => void;
  onSchedule: () => void;
}

const ContactActionButtons = ({ contact, onStatusChange, onSchedule }: ContactActionButtonsProps) => {
  const statusOptions = contact.status ? getStatusOptions(contact.type, contact.status) : [];
  
  return (
    <div className="flex p-4 gap-3 border-b">
      <Button size="sm" className="bg-[#0485ea] hover:bg-[#0375d1]">
        <Mail className="mr-1 h-4 w-4" />
        Email
      </Button>
      <Button size="sm" variant="outline">
        <Phone className="mr-1 h-4 w-4" />
        Call
      </Button>
      <Button 
        size="sm" 
        variant="outline"
        onClick={onSchedule}
      >
        <Calendar className="mr-1 h-4 w-4" />
        Schedule
      </Button>
      
      {contact.status && statusOptions.length > 0 && onStatusChange && (
        <div className="ml-auto">
          <StatusDropdown 
            contact={contact} 
            onStatusChange={onStatusChange} 
            statusOptions={statusOptions} 
          />
        </div>
      )}
    </div>
  );
};

export default ContactActionButtons;
