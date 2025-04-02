
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { CheckIcon, ChevronDown } from 'lucide-react';
import UniversalStatusControl, { StatusOption } from '@/components/common/status/UniversalStatusControl';

interface Contact {
  id: string;
  status: string;
}

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

  return (
    <div className="flex items-center relative z-10">
      <UniversalStatusControl
        entityId={contact.id}
        entityType="CONTACT"
        currentStatus={contact.status || 'PROSPECT'}
        statusOptions={statusOptions}
        tableName="contacts"
        idField="id"
        onStatusChange={onStatusChange}
        size="sm"
        showStatusBadge={true}
      />
    </div>
  );
};

export default ContactsStatusDropdown;
