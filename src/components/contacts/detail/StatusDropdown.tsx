import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckIcon, ChevronDown } from 'lucide-react';
import UniversalStatusControl, { StatusOption } from '@/components/common/status/UniversalStatusControl';
import { Contact } from '@/types/contact';

interface ContactsStatusDropdownProps {
  contact: Contact;
  onStatusChange: () => void;
}

const ContactsStatusDropdown: React.FC<ContactsStatusDropdownProps> = ({ contact, onStatusChange }) => {
  const [open, setOpen] = useState(false);

  const statusOptions: StatusOption[] = useMemo(() => [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'archived', label: 'Archived' },
  ], []);

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
