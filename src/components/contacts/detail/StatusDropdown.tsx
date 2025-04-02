
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { CheckIcon, ChevronDown } from 'lucide-react';
import UniversalStatusControl, { StatusOption } from '@/components/common/status/UniversalStatusControl';

interface Contact {
  contactid: string;
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
      { value: 'active', label: 'Active', color: 'green' },
      { value: 'inactive', label: 'Inactive', color: 'neutral' },
      { value: 'pending', label: 'Pending', color: 'amber' },
      { value: 'archived', label: 'Archived', color: 'neutral' },
    ]
  , [providedStatusOptions]);

  return (
    <div className="flex items-center relative z-10">
      <UniversalStatusControl
        entityId={contact.contactid}
        entityType="CONTACT"
        currentStatus={contact.status}
        statusOptions={statusOptions}
        tableName="contacts"
        idField="contactid"
        onStatusChange={onStatusChange}
        size="sm"
        showStatusBadge={true}
      />
    </div>
  );
};

export default ContactsStatusDropdown;
