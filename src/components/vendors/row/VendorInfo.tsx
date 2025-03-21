
import React from 'react';
import { Vendor } from '../VendorsTable';

interface VendorInfoProps {
  vendor: Vendor;
}

const VendorInfo = ({ vendor }: VendorInfoProps) => {
  return (
    <div>
      <div className="font-medium text-[#0485ea]">{vendor.vendorname || 'Unnamed Vendor'}</div>
      <div className="text-xs text-muted-foreground">{vendor.vendorid}</div>
    </div>
  );
};

export default VendorInfo;
