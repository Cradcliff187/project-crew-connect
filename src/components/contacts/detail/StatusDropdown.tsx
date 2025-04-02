
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

  // Create wrapper that calls onStatusChange with the new status
  const handleStatusChange = () => {
    // This function doesn't need to do anything directly
    // The UniversalStatusControl component will call onStatusChange with the new status
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
        onStatusChange={handleStatusChange}
        additionalUpdateHandler={(newStatus: string) => onStatusChange(newStatus)}
        size="sm"
        showStatusBadge={true}
      />
    </div>
  );
};

export default ContactsStatusDropdown;
