
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { CheckIcon, ChevronDown } from 'lucide-react';
import UniversalStatusControl, { StatusOption } from '@/components/common/status/UniversalStatusControl';
import { Contact } from '@/pages/Contacts';

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
  const statusOptions: StatusOption[] = useMemo(() => 
    providedStatusOptions || [
      { value: 'ACTIVE', label: 'Active', color: 'green' },
      { value: 'INACTIVE', label: 'Inactive', color: 'neutral' },
      { value: 'PROSPECT', label: 'Prospect', color: 'blue' },
    ]
  , [providedStatusOptions]);

  // This is called after the status update is successful in UniversalStatusControl
  const handleStatusChange = () => {
    console.log('Status change callback triggered');
    // Call the parent's onStatusChange callback
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
