
import React from 'react';
import { Contact } from '@/pages/Contacts';
import ContactInfoSection from './ContactInfoSection';
import ContactStatusSection from './ContactStatusSection';

interface ContactDetailInformationProps {
  contact: Contact;
  onStatusChange: (contact: Contact, newStatus: string) => void;
}

const ContactDetailInformation: React.FC<ContactDetailInformationProps> = ({
  contact,
  onStatusChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ContactInfoSection contact={contact} />
      <ContactStatusSection 
        contact={contact} 
        onStatusChange={onStatusChange} 
      />
    </div>
  );
};

export default ContactDetailInformation;
