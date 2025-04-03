
import { useState } from 'react';
import { 
  CalendarIcon, 
  MailIcon, 
  PhoneIcon, 
  FileIcon, 
  UserCheckIcon,
  MoreHorizontalIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusDropdown from './StatusDropdown';
import { getStatusOptions } from './util/statusTransitions';
import TypeTransitionDialog from './TypeTransitionDialog';
import { useQueryClient } from '@tanstack/react-query';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';

interface ContactActionButtonsProps {
  contact: any;
  onStatusChange?: () => void;
  onSchedule?: () => void;
}

const ContactActionButtons = ({ 
  contact, 
  onStatusChange = () => {},
  onSchedule = () => {}
}: ContactActionButtonsProps) => {
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const statusOptions = getStatusOptions(contact.type, contact.status);
  
  const handleTypeTransitionSuccess = () => {
    // Invalidate the contacts query to refresh the data
    queryClient.invalidateQueries({ queryKey: ['contacts'] });
    
    // Call the parent's callback to refresh data
    if (onStatusChange) {
      onStatusChange();
    }
  };
  
  const handleTypeChange = async (newType: string) => {
    // This method is passed to the TypeTransitionDialog
    // The actual type change logic is handled inside the dialog
    // We'll be notified via the success callback
    console.log(`Changing contact type to ${newType}`);
  };
  
  // Main action groups for desktop view
  const getContactActionItems = (): ActionGroup[] => {
    return [
      {
        items: [
          {
            label: 'Change Type',
            icon: <UserCheckIcon className="h-4 w-4" />,
            onClick: () => setTypeDialogOpen(true)
          },
          {
            label: 'Schedule',
            icon: <CalendarIcon className="h-4 w-4" />,
            onClick: onSchedule
          }
        ]
      },
      {
        items: [
          {
            label: 'Email',
            icon: <MailIcon className="h-4 w-4" />,
            onClick: () => window.open(`mailto:${contact.email}`)
          },
          {
            label: 'Call',
            icon: <PhoneIcon className="h-4 w-4" />,
            onClick: () => window.open(`tel:${contact.phone}`)
          },
          {
            label: 'Documents',
            icon: <FileIcon className="h-4 w-4" />,
            onClick: () => console.log('Open documents')
          }
        ]
      }
    ];
  };
  
  return (
    <div className="border-b">
      <div className="container py-2 flex flex-wrap gap-2 justify-start items-center">
        <StatusDropdown 
          contact={contact} 
          onStatusChange={onStatusChange} 
        />
        
        {/* Show main buttons on larger screens */}
        <div className="hidden sm:flex gap-2">
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
        
        {/* ActionMenu for mobile-friendly access to all options */}
        <div className="sm:hidden ml-auto">
          <ActionMenu 
            groups={getContactActionItems()} 
            variant="outline" 
            size="sm" 
          />
        </div>
      </div>

      <TypeTransitionDialog
        contact={contact}
        open={typeDialogOpen}
        onOpenChange={setTypeDialogOpen}
        onTypeChange={handleTypeChange}
        onSuccess={handleTypeTransitionSuccess}
      />
    </div>
  );
};

export default ContactActionButtons;
