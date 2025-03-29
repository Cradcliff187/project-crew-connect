
import React from 'react';
import { Vendor } from '../types/vendorTypes';

interface VendorLocationProps {
  vendor: Vendor;
}

const VendorLocation = ({ vendor }: VendorLocationProps) => {
  return (
    <>
      {vendor.city && vendor.state ? (
        <div>{vendor.city}, {vendor.state}</div>
      ) : (
        <div className="text-muted-foreground">No Location</div>
      )}
    </>
  );
};

export default VendorLocation;
