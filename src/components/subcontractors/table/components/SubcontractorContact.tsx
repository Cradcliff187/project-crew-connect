
import React from 'react';
import { Mail, Phone } from 'lucide-react';

interface SubcontractorContactProps {
  email: string | null;
  phone: string | null;
}

const SubcontractorContact = ({ email, phone }: SubcontractorContactProps) => {
  return (
    <div className="flex flex-col gap-1">
      {email && (
        <div className="flex items-center gap-1">
          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm">{email}</span>
        </div>
      )}
      {phone && (
        <div className="flex items-center gap-1">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm">{phone}</span>
        </div>
      )}
    </div>
  );
};

export default SubcontractorContact;
