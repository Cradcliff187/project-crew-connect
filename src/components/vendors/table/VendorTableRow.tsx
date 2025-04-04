
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { Vendor } from '../types/vendorTypes';
import StatusBadge from '@/components/ui/StatusBadge';
import { StatusType } from '@/types/common';
import VendorInfo from '../row/VendorInfo';
import VendorContactInfo from '../row/VendorContactInfo';
import VendorLocation from '../row/VendorLocation';
import VendorActionsMenu from './components/VendorActionsMenu';

interface VendorTableRowProps {
  vendor: Vendor;
  onViewDetails: (vendor: Vendor) => void;
  onEditVendor: (vendor: Vendor) => void;
}

const VendorTableRow: React.FC<VendorTableRowProps> = ({ 
  vendor, 
  onViewDetails, 
  onEditVendor 
}) => {
  const navigate = useNavigate();

  // Handle row click
  const handleRowClick = () => {
    navigate(`/vendors/${vendor.vendorid}`);
  };

  // Get vendor status color
  const getStatusType = (status: string | undefined): StatusType => {
    if (!status) return 'neutral';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'neutral';
      case 'approved':
        return 'info';
      case 'potential':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <TableRow onClick={handleRowClick} className="cursor-pointer hover:bg-[#0485ea]/5 transition-colors">
      <TableCell className="py-3">
        <VendorInfo vendor={vendor} />
      </TableCell>
      <TableCell className="py-3">
        <VendorContactInfo vendor={vendor} />
      </TableCell>
      <TableCell className="py-3">
        <VendorLocation vendor={vendor} />
      </TableCell>
      <TableCell className="py-3">
        <div className="flex justify-center">
          <StatusBadge 
            status={getStatusType(vendor.status)} 
            label={vendor.status || 'Unknown'} 
            size="default"
          />
        </div>
      </TableCell>
      <TableCell className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
        <VendorActionsMenu 
          vendor={vendor}
          onViewDetails={onViewDetails}
          onEditVendor={onEditVendor}
        />
      </TableCell>
    </TableRow>
  );
};

export default VendorTableRow;
