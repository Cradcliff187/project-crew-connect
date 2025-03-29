
import React from 'react';
import { Building2, ChevronRight, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import StatusBadge from '@/components/ui/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { StatusType } from '@/types/common';
import { Vendor } from '../types/vendorTypes';

interface VendorTableRowProps {
  vendor: Vendor;
  onViewDetails?: (vendor: Vendor) => void;
  onEditVendor?: (vendor: Vendor) => void;
}

const VendorTableRow: React.FC<VendorTableRowProps> = ({ 
  vendor, 
  onViewDetails, 
  onEditVendor 
}) => {
  const navigate = useNavigate();

  const handleViewVendor = () => {
    if (onViewDetails) {
      onViewDetails(vendor);
    } else {
      navigate(`/vendors/${vendor.vendorid}`);
    }
  };

  const formatAddress = () => {
    const parts = [
      vendor.address,
      vendor.city,
      vendor.state,
      vendor.zip
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : 'No address provided';
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{vendor.vendorname}</span>
          <span className="text-xs text-muted-foreground">{vendor.vendorid}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          {vendor.email && (
            <span className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3" />
              {vendor.email}
            </span>
          )}
          {vendor.phone && (
            <span className="flex items-center gap-1 text-sm">
              <Phone className="h-3 w-3" />
              {vendor.phone}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-start gap-1">
          <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <span className="text-sm">{formatAddress()}</span>
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={(vendor.status?.toLowerCase() || 'unknown') as StatusType} />
      </TableCell>
      <TableCell>
        <span className="text-sm">{vendor.payment_terms || 'Not specified'}</span>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" onClick={handleViewVendor}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default VendorTableRow;
