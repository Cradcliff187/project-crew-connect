
import { useState } from 'react';
import { 
  CalendarIcon, 
  MailIcon, 
  PhoneIcon, 
  FileIcon, 
  UserCheckIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusDropdown from './StatusDropdown';
import { getStatusOptions } from './util/statusTransitions';
import TypeTransitionDialog from './TypeTransitionDialog';
import { useQueryClient } from '@tanstack/react-query';

interface ContactActionButtonsProps {
  contact: any;
  onStatusChange?: (newStatus: string) => void;
  onSchedule?: () => void;
}

const ContactActionButtons = ({ 
  contact, 
  onStatusChange,
  onSchedule
}: ContactActionButtonsProps) => {
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const statusOptions = getStatusOptions(contact.type, contact.status);
  
  const handleTypeTransitionSuccess = () => {
    // Invalidate the contacts query to refresh the data
    queryClient.invalidateQueries({ queryKey: ['contacts'] });
  };
  
  return (
    <div className="border-b">
      <div className="container py-2 flex flex-wrap gap-2 justify-start items-center">
        <StatusDropdown 
          contact={contact} 
          onStatusChange={onStatusChange} 
          statusOptions={statusOptions}
        />
        
        <Button size="sm" variant="outline" onClick={() => setTypeDialogOpen(true)}>
          <UserCheckIcon className="h-4 w-4 mr-1" />
          Change Type
        </Button>
        
        <Button size="sm" variant="outline" onClick={onSchedule}>
          <CalendarIcon className="h-4 w-4 mr-1" />
          Schedule
        </Button>
        
        <Button size="sm" variant="outline" asChild>
          <a href={`mailto:${contact.email}`}>
            <MailIcon className="h-4 w-4 mr-1" />
            Email
          </a>
        </Button>
        
        <Button size="sm" variant="outline" asChild>
          <a href={`tel:${contact.phone}`}>
            <PhoneIcon className="h-4 w-4 mr-1" />
            Call
          </a>
        </Button>
        
        <Button size="sm" variant="outline">
          <FileIcon className="h-4 w-4 mr-1" />
          Documents
        </Button>
      </div>

      <TypeTransitionDialog
        contact={contact}
        open={typeDialogOpen}
        onOpenChange={setTypeDialogOpen}
        onSuccess={handleTypeTransitionSuccess}
      />
    </div>
  );
};

export default ContactActionButtons;
