
import React from 'react';
import { MapPin } from 'lucide-react';
import { Vendor } from '../types/vendorTypes';

interface VendorLocationProps {
  vendor: Vendor;
}

const VendorLocation = ({ vendor }: VendorLocationProps) => {
  // Format address for display
  const formatAddress = () => {
    const parts = [
      vendor.city,
      vendor.state,
      vendor.zip
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : 'No location information';
  };

  return (
    <div className="flex items-center gap-1">
      <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <span className="text-sm">{formatAddress()}</span>
    </div>
  );
};

export default VendorLocation;
