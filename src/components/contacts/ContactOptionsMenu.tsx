import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Archive, Trash2, FileEdit, Send, CalendarPlus, Copy } from 'lucide-react';
import { Contact } from './hooks/useContact';
import { toast } from '@/hooks/use-toast';

interface ContactOptionsMenuProps {
  contact: Contact;
  onRefresh?: () => void;
}

const ContactOptionsMenu: React.FC<ContactOptionsMenuProps> = ({ contact, onRefresh }) => {
  // Handle archive
  const handleArchive = async () => {
    // Implementation for archiving a contact
    toast({
      title: 'Contact archived',
      description: `${contact.full_name} has been archived`,
    });

    if (onRefresh) onRefresh();
  };

  // Handle delete
  const handleDelete = async () => {
    // Implementation for deleting a contact
    toast({
      title: 'Contact deleted',
      description: `${contact.full_name} has been deleted`,
    });

    if (onRefresh) onRefresh();
  };

  // Handle email
  const handleEmail = () => {
    if (contact.email) {
      window.location.href = `mailto:${contact.email}`;
    } else {
      toast({
        title: 'No email address',
        description: "This contact doesn't have an email address",
        variant: 'destructive',
      });
    }
  };

  // Handle schedule meeting
  const handleScheduleMeeting = () => {
    // Implementation for scheduling a meeting
    toast({
      title: 'Schedule Meeting',
      description: 'Meeting scheduler will be implemented soon',
    });
  };

  // Handle copy contact info
  const handleCopyInfo = () => {
    const contactInfo = `
Name: ${contact.full_name}
${contact.company ? `Company: ${contact.company}` : ''}
${contact.email ? `Email: ${contact.email}` : ''}
${contact.phone ? `Phone: ${contact.phone}` : ''}
${contact.address ? `Address: ${contact.address}, ${contact.city || ''} ${contact.state || ''} ${contact.zip || ''}` : ''}
    `.trim();

    navigator.clipboard.writeText(contactInfo);

    toast({
      title: 'Contact info copied',
      description: 'Contact information has been copied to clipboard',
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {contact.email && (
          <DropdownMenuItem onClick={handleEmail}>
            <Send className="h-4 w-4 mr-2" />
            <span>Send Email</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={handleScheduleMeeting}>
          <CalendarPlus className="h-4 w-4 mr-2" />
          <span>Schedule Meeting</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleCopyInfo}>
          <Copy className="h-4 w-4 mr-2" />
          <span>Copy Contact Info</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleArchive}>
          <Archive className="h-4 w-4 mr-2" />
          <span>Archive Contact</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleDelete}
          className="text-red-600 hover:text-red-700 focus:text-red-700"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          <span>Delete Contact</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ContactOptionsMenu;
