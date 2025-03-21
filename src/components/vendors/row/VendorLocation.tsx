
import React from 'react';
import { Vendor } from '../VendorsTable';

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
