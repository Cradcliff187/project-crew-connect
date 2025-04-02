
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckIcon, ChevronDown } from 'lucide-react';
import UniversalStatusControl, { StatusOption } from '@/components/common/status/UniversalStatusControl';
import { Contact } from '@/pages/Contacts';
import { updateContactStatus } from './util/contactTransitions';

interface ContactsStatusDropdownProps {
  contact: Contact;
  onStatusChange: () => void;
  statusOptions?: StatusOption[];
}

const ContactsStatusDropdown: React.FC<ContactsStatusDropdownProps> = ({ 
  contact, 
  onStatusChange,
  statusOptions: providedStatusOptions 
}) => {
  // Use provided status options or fallback to defaults
  const statusOptions = providedStatusOptions || [
    { value: 'ACTIVE', label: 'Active', color: 'green' },
    { value: 'INACTIVE', label: 'Inactive', color: 'neutral' },
    { value: 'PROSPECT', label: 'Prospect', color: 'blue' },
  ];

  // Handle status changes internally, then call parent callback
  const handleStatusChange = async () => {
    console.log('Status change successful, notifying parent component');
    // Call the parent's callback to refresh data
    onStatusChange();
  };

  return (
    <div className="flex items-center relative z-10">
      <UniversalStatusControl
        entityId={contact.id}
        entityType="CONTACT"
        currentStatus={contact.status || 'PROSPECT'}
        statusOptions={statusOptions}
        tableName="contacts"
        idField="id"
        onStatusChange={handleStatusChange}
        size="sm"
        showStatusBadge={true}
      />
    </div>
  );
};

export default ContactsStatusDropdown;
