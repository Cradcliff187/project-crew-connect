
import { Vendor } from './VendorTableRow';
import VendorTableRow from './VendorTableRow';

interface VendorsTableBodyProps {
  vendors: Vendor[];
  onViewDetails: (vendor: Vendor) => void;
  onEditVendor: (vendor: Vendor) => void;
}

const VendorsTableBody = ({ 
  vendors, 
  onViewDetails, 
  onEditVendor 
}: VendorsTableBodyProps) => {
  return (
    <>
      {vendors.map((vendor) => (
        <VendorTableRow 
          key={vendor.vendorid} 
          vendor={vendor} 
          onViewDetails={onViewDetails}
          onEditVendor={onEditVendor}
        />
      ))}
    </>
  );
};

export default VendorsTableBody;
