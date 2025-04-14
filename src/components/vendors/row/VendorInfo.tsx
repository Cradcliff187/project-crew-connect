import React from 'react';
import { Vendor } from '../types/vendorTypes';

interface VendorInfoProps {
  vendor: Vendor;
}

const VendorInfo = ({ vendor }: VendorInfoProps) => {
  return (
    <div className="flex flex-col">
      <span className="font-medium">{vendor.vendorname || 'Unnamed Vendor'}</span>
      <span className="text-xs text-muted-foreground">{vendor.vendorid}</span>
    </div>
  );
};

export default VendorInfo;
