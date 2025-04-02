
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { CheckIcon, ChevronDown } from 'lucide-react';
import UniversalStatusControl, { StatusOption } from '@/components/common/status/UniversalStatusControl';
import { Contact } from '@/pages/Contacts';

interface ContactsStatusDropdownProps {
  contact: Contact;
  onStatusChange: (newStatus: string) => void; // Updated to accept status parameter
  statusOptions?: StatusOption[];
}

const ContactsStatusDropdown: React.FC<ContactsStatusDropdownProps> = ({ 
  contact, 
  onStatusChange,
  statusOptions: providedStatusOptions 
}) => {
  const statusOptions: StatusOption[] = useMemo(() => 
    providedStatusOptions || [
      { value: 'ACTIVE', label: 'Active', color: 'green' },
      { value: 'INACTIVE', label: 'Inactive', color: 'neutral' },
      { value: 'PROSPECT', label: 'Prospect', color: 'blue' },
    ]
  , [providedStatusOptions]);

  // Handler that will be passed to UniversalStatusControl's onStatusChange prop
  const handleStatusChangeInternal = () => {
    // This function is called by UniversalStatusControl with no parameters
    // The actual status change is handled by additionalUpdateHandler
    console.log("Status change delegated to UniversalStatusControl");
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
        onStatusChange={handleStatusChangeInternal} // No-argument function
        additionalUpdateHandler={(newStatus: string) => onStatusChange(newStatus)}
        size="sm"
        showStatusBadge={true}
      />
    </div>
  );
};

export default ContactsStatusDropdown;
