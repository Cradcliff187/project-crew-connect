
import React from 'react';
import { Vendor } from '../VendorsTable';
import { Mail, Phone } from 'lucide-react';

interface VendorContactInfoProps {
  vendor: Vendor;
}

const VendorContactInfo = ({ vendor }: VendorContactInfoProps) => {
  return (
    <div className="flex flex-col gap-1">
      {vendor.email && (
        <div className="flex items-center gap-1">
          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm">{vendor.email}</span>
        </div>
      )}
      {vendor.phone && (
        <div className="flex items-center gap-1">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm">{vendor.phone}</span>
        </div>
      )}
      {!vendor.email && !vendor.phone && (
        <div className="text-xs text-muted-foreground">No contact information</div>
      )}
    </div>
  );
};

export default VendorContactInfo;
