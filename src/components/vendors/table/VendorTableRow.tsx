import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { Vendor } from '../types/vendorTypes';
import StatusBadge from '@/components/common/status/StatusBadge';
import VendorInfo from '../row/VendorInfo';
import VendorContactInfo from '../row/VendorContactInfo';
import VendorLocation from '../row/VendorLocation';
import VendorActionsMenu from './components/VendorActionsMenu';

interface VendorTableRowProps {
  vendor: Vendor;
  onViewDetails: (vendor: Vendor) => void;
  onEditVendor: (vendor: Vendor) => void;
}

const VendorTableRow: React.FC<VendorTableRowProps> = ({ vendor, onViewDetails, onEditVendor }) => {
  const navigate = useNavigate();

  // Handle row click
  const handleRowClick = () => {
    navigate(`/vendors/${vendor.vendorid}`);
  };

  return (
    <TableRow
      onClick={handleRowClick}
      className="cursor-pointer hover:bg-muted/50 transition-colors"
    >
      <TableCell className="font-medium py-3">
        <VendorInfo vendor={vendor} />
      </TableCell>
      <TableCell className="py-3">
        <VendorContactInfo vendor={vendor} />
      </TableCell>
      <TableCell className="py-3">
        <VendorLocation vendor={vendor} />
      </TableCell>
      <TableCell className="py-3 text-center">
        <div className="flex justify-center">
          <StatusBadge
            status={vendor.status?.toLowerCase() || 'unknown'}
            label={vendor.status || 'Unknown'}
          />
        </div>
      </TableCell>
      <TableCell className="py-3 text-right" onClick={e => e.stopPropagation()}>
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
