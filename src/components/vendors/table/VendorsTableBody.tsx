
import React from 'react';
import { TableBody } from '@/components/ui/table';
import VendorTableRow from './VendorTableRow';
import { Vendor } from '../types/vendorTypes';

interface VendorsTableBodyProps {
  vendors: Vendor[];
  onViewDetails: (vendor: Vendor) => void;
  onEditVendor: (vendor: Vendor) => void;
}

const VendorsTableBody: React.FC<VendorsTableBodyProps> = ({ 
  vendors, 
  onViewDetails, 
  onEditVendor 
}) => {
  return (
    <TableBody>
      {vendors.map((vendor) => (
        <VendorTableRow 
          key={vendor.vendorid}
          vendor={vendor}
          onViewDetails={onViewDetails}
          onEditVendor={onEditVendor}
        />
      ))}
    </TableBody>
  );
};

export default VendorsTableBody;
