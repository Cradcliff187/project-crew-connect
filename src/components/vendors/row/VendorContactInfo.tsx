
import React from 'react';
import { Vendor } from '../VendorsTable';

interface VendorContactInfoProps {
  vendor: Vendor;
}

const VendorContactInfo = ({ vendor }: VendorContactInfoProps) => {
  return (
    <>
      <div>{vendor.email || 'No Email'}</div>
      <div className="text-xs text-muted-foreground">{vendor.phone || 'No Phone'}</div>
    </>
  );
};

export default VendorContactInfo;
